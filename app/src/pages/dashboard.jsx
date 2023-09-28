import { useWallet } from "@solana/wallet-adapter-react"
import { PhantomWalletName } from "@solana/wallet-adapter-wallets"
import { useEffect, useState } from "react"
import { Button } from "src/components/Button"
import { PostForm } from "src/components/PostForm"
import { useBlog } from "src/context/Blog"
import { useHistory } from 'react-router-dom'

export const Dashboard = () => {
  const history = useHistory()
  const [connecting, setConnecting] = useState(false)
  const { connected, select } = useWallet()
  const [postTitle, setPostTitle] = useState("")
  const [postContent, setPostContent] = useState("")
  const { user, initialized, initUser, showModal, setShowModal, createPost, posts } = useBlog()

  const onConnect = () => {
    setConnecting(true)
    select(PhantomWalletName)
  }

  useEffect(() => {
    if (user) {
      setConnecting(true)
    }
  }, [user])

  return (
    <div className="dashboard background-color overflow-auto h-screen">
      <header className="fixed z-10 w-full h-14  shadow-md">
        <div className="flex justify-between items-center h-full container">
          <h2 className="text-2xl font-bold">
            <div className="bg-clip-text bg-gradient-to-br from-indigo-300 colorpink"
            >
              Solana Reddit
            </div>
          </h2>
          {connected ? (
            <div className="flex items-center">
              <img
                src={user?.avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full bg-gray-200 shadow ring-2 ring-indigo-400 ring-offset-2 ring-opacity-50"
              />
              <p className="font-bold text-sm ml-2 capitalize">
                {user?.name}
              </p>
              {initialized ? (
                <div className="flex">
                  <Button
                    className="ml-3 mr-2"
                    onClick={() => {
                      setShowModal(true);
                    }}
                  >
                    Create Post
                  </Button>
                  <Button
                    className="ml-3 mr-2"
                    onClick={() => {
                      setShowModal(true);
                    }}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  className="ml-3 mr-2"
                  onClick={() => {
                    initUser();
                  }}
                >
                  Initialize User
                </Button>
              )}
            </div>
          ) : (
            <Button
              loading={connecting}
              className="w-28"
              onClick={onConnect}
              leftIcon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {/* ... (Connect icon SVG path) */}
                </svg>
              }
            >
              Connect
            </Button>
          )}

        </div>
      </header>
      <main className="dashboard-main pb-4 container flex relative">
        <div className="pt-3">
          {<h1 className="title">-------SOLANA REDDIT------- </h1>}
          <div className="row">

            <article className="best-post">
              <div
                className="best-post-image"
                style={{
                  backgroundImage: `url("https://imgs.hipertextual.com/wp-content/uploads/2021/08/reddit-2.png")`,
                }}
              ></div>
            </article>

            <div className="all__posts">
              {posts.map((item) => {
                return (
                  <article className="post__card-2"
                    onClick={() => {
                      history.push(`/read-post/${item.publicKey.toString()}`)
                    }}
                    key={item.account.id}
                  >
                    <div className="post__card_-2">
                      <div
                        className="post__card__image-2"
                        style={{
                          backgroundImage: `url("https://media.wired.com/photos/5a55b7eb091d162e40e4b202/191:100/w_1280,c_limit/reddit-alien-red.jpg")`,
                        }}
                      ></div>
                      <div>
                        <div className="post__card_meta-2">
                          <div className="post__card_cat"><span className="dot"> </span>{item.account.title} </div>
                          <p className="post__card_alttitle-2">
                            {item.account.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
        <div className={`modal ${showModal && 'show-modal'}`} >
          <div className="modal-content">
            <span className="close-button"
              onClick={() => setShowModal(false)}
            >×</span>
            <PostForm
              postTitle={postTitle}
              postContent={postContent}
              setPostTitle={setPostTitle}
              setPostContent={setPostContent}
              onSubmit={() => createPost(postTitle, postContent)}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
