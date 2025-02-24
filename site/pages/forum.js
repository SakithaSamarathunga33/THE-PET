import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import MyHead from '../components/MyHead'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { MdPets, MdForum, MdComment, MdTrendingUp, MdAccessTime } from 'react-icons/md'
import { FaUser, FaComments, FaHeart, FaPaw, FaReply } from 'react-icons/fa'

export default function Forum() {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Pet Care' })
  const [selectedPost, setSelectedPost] = useState(null)
  const [reply, setReply] = useState('')

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchPosts(), checkAuthStatus()]);
      } catch (error) {
        console.error('Error initializing page:', error);
        setError('Failed to initialize page. Please refresh.');
      }
    };

    initializePage();

    // Set up polling interval
    const interval = setInterval(fetchPosts, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Don't remove token on network errors or temporary issues
        if (response.status === 401) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      // Don't remove token on network errors
      if (err.message.includes('401')) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:8080/api/forum/posts', {
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        // Don't throw error on auth issues for public routes
        if (response.status === 401) {
          console.warn('Not authenticated, showing public posts');
        } else {
          throw new Error('Failed to fetch posts');
        }
      }

      const data = await response.json();
      console.log('Fetched posts:', data);

      if (Array.isArray(data)) {
        // Sort posts by date, newest first
        const sortedPosts = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(sortedPosts);
        setError(null);
      } else {
        console.error('Invalid posts data received:', data);
        setPosts([]);
        setError('Error loading discussions. Invalid data format.');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load discussions. Please try again later.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to create a post');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(newPost)
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setUser(null);
          setError('Your session has expired. Please log in again.');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      const data = await response.json();
      setPosts(prevPosts => [data, ...prevPosts]);
      setNewPost({ title: '', content: '', category: 'Pet Care' });
      setShowNewPostForm(false);
      setError(null);
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
    }
  }

  const handleAddReply = async (postId) => {
    if (!reply.trim()) return
    
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Please log in to reply')
      return
    }

    try {
      const response = await fetch(`http://localhost:8080/api/forum/posts/${postId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: reply })
      })

      const data = await response.json()
      
      if (response.ok) {
        const updatedPosts = posts.map(post => 
          post._id === postId ? data : post
        )
        setPosts(updatedPosts)
        setReply('')
        setSelectedPost(null)
      } else {
        setError(data.message)
      }
    } catch (err) {
      console.error('Error adding reply:', err)
      setError('Failed to add reply. Please try again.')
    }
  }

  const handleLike = async (postId) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Please log in to like posts')
      return
    }

    try {
      const response = await fetch(`http://localhost:8080/api/forum/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const updatedPosts = posts.map(post => 
          post._id === postId ? data : post
        )
        setPosts(updatedPosts)
      }
    } catch (err) {
      console.error('Error liking post:', err)
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

      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
            <button
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <span className="sr-only">Close</span>
              <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

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
          {user ? (
            <button 
              onClick={() => setShowNewPostForm(true)}
              className="bg-[#4DB6AC] hover:bg-[#4DB6AC]/90 text-white px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Start New Discussion
            </button>
          ) : (
            <button 
              onClick={() => router.push('/login')}
              className="bg-[#4DB6AC] hover:bg-[#4DB6AC]/90 text-white px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Login to Post
            </button>
          )}
        </div>
      </section>

      {/* New Post Form Modal */}
      {showNewPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Create New Post</h2>
            <form onSubmit={handleCreatePost}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4DB6AC]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Category
                </label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4DB6AC]"
                >
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Content
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4DB6AC] h-32"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowNewPostForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4DB6AC] text-white rounded-lg hover:bg-[#4DB6AC]/90"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <button 
                onClick={fetchPosts}
                className="flex items-center text-gray-600 hover:text-[#4DB6AC]"
              >
                <MdAccessTime className="mr-2" /> Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4DB6AC]"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">
              <p>{error}</p>
              <button 
                onClick={fetchPosts}
                className="mt-4 px-4 py-2 bg-[#4DB6AC] text-white rounded-lg hover:bg-[#4DB6AC]/90"
              >
                Try Again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No discussions yet. Be the first to start a conversation!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div 
                  key={post._id}
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
                        <span className="font-semibold">{post.author?.name || 'Anonymous'}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 text-sm">{formatDate(post.createdAt)}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-[#4DB6AC] text-sm">{post.category}</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                      <p className="text-gray-600 mb-4">{post.content}</p>
                      <div className="flex items-center space-x-6">
                        <button 
                          onClick={() => setSelectedPost(selectedPost === post._id ? null : post._id)}
                          className="flex items-center text-gray-500 hover:text-[#4DB6AC]"
                        >
                          <MdComment className="mr-2" />
                          {post.replies?.length || 0} Comments
                        </button>
                        <button 
                          onClick={() => handleLike(post._id)}
                          className={`flex items-center ${post.likes?.includes(user?._id) ? 'text-[#FF7043]' : 'text-gray-500 hover:text-[#FF7043]'}`}
                        >
                          <FaHeart className="mr-2" />
                          {post.likes?.length || 0} Likes
                        </button>
                      </div>

                      {/* Replies Section */}
                      {selectedPost === post._id && (
                        <div className="mt-6 space-y-4">
                          {post.replies?.map((reply, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <FaUser className="text-gray-400" />
                                <span className="font-medium">{reply.author?.name}</span>
                                <span className="text-gray-500 text-sm">{formatDate(reply.createdAt)}</span>
                              </div>
                              <p className="text-gray-600">{reply.content}</p>
                            </div>
                          ))}
                          
                          {user ? (
                            <div className="mt-4">
                              <textarea
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                placeholder="Write a reply..."
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4DB6AC] h-24"
                              />
                              <div className="mt-2 flex justify-end">
                                <button
                                  onClick={() => handleAddReply(post._id)}
                                  className="px-4 py-2 bg-[#4DB6AC] text-white rounded-lg hover:bg-[#4DB6AC]/90"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <button
                                onClick={() => router.push('/login')}
                                className="text-[#4DB6AC] hover:underline"
                              >
                                Login to reply
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-16 bg-gradient-to-r from-[#4DB6AC] to-[#FF7043]">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold text-white mb-6">
              Join Our Growing Community
            </h2>
            <p className="text-white/90 mb-8 text-lg">
              Share your pet stories, get advice, and connect with other pet lovers
            </p>
            <button 
              onClick={() => router.push('/register')}
              className="bg-white text-[#4DB6AC] px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-[#FFF3E0]"
            >
              Create Account
            </button>
          </div>
        </section>
      )}
    </>
  )
}