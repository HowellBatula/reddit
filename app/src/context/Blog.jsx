import * as anchor from '@project-serum/anchor'
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { getAvatarUrl } from "src/functions/getAvatarUrl";
import { getRandomName } from "src/functions/getRandomName";
import idl from "src/idl.json";
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey'
import { utf8 } from '@project-serum/anchor/dist/cjs/utils/bytes'
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { async } from 'rxjs';

const PROGRAM_KEY = new PublicKey(idl.metadata.address);
const BlogContext = createContext();


export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error("Parent must be wrapped inside PostsProvider");
  }

  return context;
};

export const BlogProvider = ({ children }) => {

  const [user, setUser] = useState()
  const [initialized, setInitialized] = useState(false)
  const [transactionPending, setTransactionPending] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [lastPostId, setlastPostId] = useState(0)
  const [posts, setPosts] = useState([])


  const anchorWallet = useAnchorWallet()
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const program = useMemo(() => {
    if (anchorWallet) {
      const provider = new anchor.AnchorProvider(connection, anchorWallet, anchor.AnchorProvider.defaultOptions())
      return new anchor.Program(idl, PROGRAM_KEY, provider)

    }

  }, [connection, anchorWallet])

  useEffect(() => {
    const start = async () => {
      if (program && publicKey) {
        try {
          // check if there's a user
          setTransactionPending(true)
          const [userPda] = await findProgramAddressSync([utf8.encode('user'), publicKey.toBuffer()], program.programId)
          const user = await program.account.userAccount.fetch(userPda)
          if (user) {
            setInitialized(true)
            setUser(user)
            setlastPostId(user.lastPostId)

            const postAccounts = await program.account.postAccount.all()
            setPosts(postAccounts)
            console.log(postAccounts)
          } else {
            // Handle the case when there's no user
            setInitialized(true);
          }
        } catch (err) {
          console.log("No User")
          // Handle the case when there's no user
          setInitialized(true);
        } finally {

        }
      }
    }

    start()

  }, [program, publicKey, transactionPending])

  const initUser = async () => {
    if (program && publicKey) {
      try {
        setTransactionPending(true)
        const name = getRandomName()
        const avatar = getAvatarUrl(name)
        const [userPda] = await findProgramAddressSync([utf8.encode('user'), publicKey.toBuffer()], program.programId)


        await program.methods
          .initUser(name, avatar,)
          .accounts({
            userAccount: userPda,
            authority: publicKey,
            systemProgram: SystemProgram.programId
          })
          .rpc()
        setInitialized(true)
      } catch (err) {
        console.log(err)
      } finally {
        // Handle the case when there's no user
        setInitialized(true);

      }
    }
  }

  const createPost = async (title, content) => {
    if (program && publicKey) {
      setTransactionPending(true)
      try {
        const [userPda] = await findProgramAddressSync([utf8.encode('user'), publicKey.toBuffer()], program.programId)
        const [postPda] = findProgramAddressSync([utf8.encode('post'), publicKey.toBuffer(), Uint8Array.from([lastPostId])],
          program.programId)

        await program.methods
          .createPost(title, content)
          .accounts({
            postAccount: postPda,
            userAccount: userPda,
            authority: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc()
        setShowModal(false)
      } catch (err) {
        console.log(err)
      } finally {
        setTransactionPending(false)
      }
    }
  }
  return (
    <BlogContext.Provider
      value={{
        user,
        initialized,
        initUser,
        showModal,
        setShowModal,
        createPost,
        posts,
        transactionPending,

      }}
    >
      {children}
    </BlogContext.Provider>
  );
};
