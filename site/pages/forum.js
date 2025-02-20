import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import MyHead from '../components/MyHead'
import Image from 'next/image'
import { MdPets, MdForum, MdComment, MdTrendingUp, MdAccessTime } from 'react-icons/md'
import { FaUser, FaComments, FaHeart, FaPaw } from 'react-icons/fa'

export default function Forum() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/forum/posts')
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      const data = await response.json()
      setPosts(data.content || data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError('Failed to load discussions. Please try again later.')
      setLoading(false)
    }
  }

  const categories = [
    {
      icon: <MdPets className="w-6 h-6" />,
      name: "Pet Care",
      description: "Tips and advice for pet care",
      color: "#4DB6AC"
    },
    {
      icon: <FaHeart className="w-6 h-6" />,
      name: "Pet Health",
      description: "Discuss pet health concerns",
      color: "#FF7043"
    },
    {
      icon: <FaPaw className="w-6 h-6" />,
      name: "Training",
      description: "Share training experiences",
      color: "#FFB74D"
    },
    {
      icon: <FaComments className="w-6 h-6" />,
      name: "General Discussion",
      description: "Chat about anything pet-related",
      color: "#81C784"
    }
  ]

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#4DB6AC]"></div>
      </div>
    )
  }

  return (
    <>
      <MyHead
        title="Pet Forum - THE PET"
        description="Join our pet lovers community and share your experiences"
        image="/images/white.png"
        url="https://thepet.com/forum"
      />
      <NavBar />

      {/* Hero Section */}
      <section className="relative py-16 bg-[#FFF3E0]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <MdForum className="w-16 h-16 mx-auto mb-6 text-[#FF7043]" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Pet Lovers <span className="text-[#4DB6AC]">Community</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Join our community of pet enthusiasts. Share experiences, ask questions, and connect with other pet lovers.
          </p>
          <button className="bg-[#4DB6AC] hover:bg-[#4DB6AC]/90 text-white px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
            Start New Discussion
          </button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div 
                key={category.name}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  <div 
                    className="p-3 rounded-full"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <div style={{ color: category.color }}>{category.icon}</div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Discussions */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Recent Discussions</h2>
            <div className="flex space-x-4">
              <button className="flex items-center text-gray-600 hover:text-[#4DB6AC]">
                <MdTrendingUp className="mr-2" /> Trending
              </button>
              <button className="flex items-center text-gray-600 hover:text-[#4DB6AC]">
                <MdAccessTime className="mr-2" /> Latest
              </button>
            </div>
          </div>

          {error ? (
            <div className="text-center text-red-500 py-8">
              <p>{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div 
                  key={post.id}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transform transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-[#4DB6AC]/20 flex items-center justify-center">
                        <FaUser className="text-[#4DB6AC] w-6 h-6" />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold">{post.author}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 text-sm">{formatDate(post.createdAt)}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-[#4DB6AC] text-sm">{post.category}</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                      <p className="text-gray-600 mb-4">{post.content}</p>
                      <div className="flex items-center space-x-6">
                        <button className="flex items-center text-gray-500 hover:text-[#4DB6AC]">
                          <MdComment className="mr-2" />
                          {post.commentCount || 0} Comments
                        </button>
                        <button className="flex items-center text-gray-500 hover:text-[#FF7043]">
                          <FaHeart className="mr-2" />
                          {post.likeCount || 0} Likes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <button className="bg-white text-[#4DB6AC] border-2 border-[#4DB6AC] px-8 py-3 rounded-lg transition-all duration-300 hover:bg-[#4DB6AC] hover:text-white">
              Load More
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#4DB6AC] to-[#FF7043]">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-6">
            Join Our Growing Community
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            Share your pet stories, get advice, and connect with other pet lovers
          </p>
          <button className="bg-white text-[#4DB6AC] px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-[#FFF3E0]">
            Create Account
          </button>
        </div>
      </section>
    </>
  )
} 