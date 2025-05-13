import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import MyHead from '../components/MyHead'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { MdPets, MdForum, MdComment, MdTrendingUp, MdAccessTime } from 'react-icons/md'
import { FaUser, FaComments, FaHeart, FaPaw, FaReply, FaSearch, FaPlus, FaShare, FaComment } from 'react-icons/fa'
import { motion } from 'framer-motion'

// Sample data for forum posts
const SAMPLE_POSTS = [
  {
    _id: 'post1',
    title: 'Tips for first-time dog owners',
    content: 'I just adopted my first dog and wanted to share some tips that have helped me in the first month...',
    author: {
      _id: 'user1',
      name: 'John Doe'
    },
    category: 'Pet Care',
    createdAt: '2024-10-15T10:30:00Z',
    likes: ['user2', 'user3', 'user4'],
    replies: [
      {
        _id: 'reply1',
        content: 'Great tips! I would also add that consistency is key when training a new dog.',
        author: {
          _id: 'user2',
          name: 'Sarah Johnson'
        },
        createdAt: '2024-10-15T11:45:00Z'
      },
      {
        _id: 'reply2',
        content: 'How do you handle separation anxiety? My new puppy gets very upset when I leave for work.',
        author: {
          _id: 'user3',
          name: 'Michael Brown'
        },
        createdAt: '2024-10-15T13:20:00Z'
      }
    ]
  },
  {
    _id: 'post2',
    title: 'Best cat breeds for apartments',
    content: 'Looking for recommendations on cat breeds that do well in smaller spaces...',
    author: {
      _id: 'user4',
      name: 'Emily Wilson'
    },
    category: 'General Discussion',
    createdAt: '2024-10-14T15:20:00Z',
    likes: ['user1', 'user5'],
    replies: [
      {
        _id: 'reply3',
        content: 'Persian cats are great for apartments! They\'re quiet and mostly like to lounge around.',
        author: {
          _id: 'user5',
          name: 'David Lee'
        },
        createdAt: '2024-10-14T16:30:00Z'
      }
    ]
  },
  {
    _id: 'post3',
    title: 'Dealing with pet allergies',
    content: 'My son has mild allergies but really wants a pet. Any suggestions for hypoallergenic options?',
    author: {
      _id: 'user6',
      name: 'Amanda Parker'
    },
    category: 'Pet Health',
    createdAt: '2024-10-13T09:15:00Z',
    likes: ['user2', 'user7', 'user8', 'user9'],
    replies: [
      {
        _id: 'reply4',
        content: 'Poodles and poodle mixes are great options! They have hair instead of fur which produces less dander.',
        author: {
          _id: 'user7',
          name: 'Robert Taylor'
        },
        createdAt: '2024-10-13T10:45:00Z'
      },
      {
        _id: 'reply5',
        content: 'Some people with allergies do well with Siberian cats or Balinese cats as they produce less of the protein that causes allergies.',
        author: {
          _id: 'user8',
          name: 'Sophia Garcia'
        },
        createdAt: '2024-10-13T11:30:00Z'
      },
      {
        _id: 'reply6',
        content: 'Have you considered reptiles or fish? They can be great pets for people with allergies.',
        author: {
          _id: 'user9',
          name: 'James Wilson'
        },
        createdAt: '2024-10-13T14:20:00Z'
      }
    ]
  },
  {
    _id: 'post4',
    title: 'Training tips for stubborn puppies',
    content: 'My 4-month old beagle is incredibly stubborn during training sessions. Any advice?',
    author: {
      _id: 'user10',
      name: 'Thomas Anderson'
    },
    category: 'Training',
    createdAt: '2024-10-12T16:40:00Z',
    likes: ['user11', 'user12'],
    replies: [
      {
        _id: 'reply7',
        content: 'Beagles can be challenging! Try shorter, more frequent training sessions with high-value treats.',
        author: {
          _id: 'user11',
          name: 'Lisa Clark'
        },
        createdAt: '2024-10-12T17:30:00Z'
      },
      {
        _id: 'reply8',
        content: 'Positive reinforcement is key. Never punish for not learning - just keep sessions fun and engaging.',
        author: {
          _id: 'user12',
          name: 'Kevin Martinez'
        },
        createdAt: '2024-10-12T18:15:00Z'
      }
    ]
  }
];

// Sample user data
const SAMPLE_USER = {
  _id: 'user1',
  name: 'John Doe',
  email: 'john@example.com'
};

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
  const [activeCategory, setActiveCategory] = useState('all')

  // Animation variants
  const fadeInUp = {
    initial: { y: 60, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

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
        // For demo purposes, set sample user
        setUser(SAMPLE_USER);
      }
    } catch (err) {
      console.log('Error checking auth status, using sample user');
      setUser(SAMPLE_USER);
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
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      console.log('Fetched posts:', data);

      if (Array.isArray(data)) {
        // Sort posts by date, newest first
        const sortedPosts = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(sortedPosts);
        setError(null);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      console.log('Using sample forum posts instead of API data');
      
      // Filter posts by category if needed
      let filteredPosts = [...SAMPLE_POSTS];
      if (activeCategory && activeCategory !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.category === activeCategory);
      }
      
      setPosts(filteredPosts);
      setError(null);
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
      // For Vercel deployment, simulate post creation
      const newPostData = {
        _id: `post${Date.now()}`,
        ...newPost,
        author: {
          _id: SAMPLE_USER._id,
          name: SAMPLE_USER.name
        },
        createdAt: new Date().toISOString(),
        likes: [],
        replies: []
      };
      
      setPosts(prevPosts => [newPostData, ...prevPosts]);
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
      // For Vercel deployment, simulate adding a reply
      const newReply = {
        _id: `reply${Date.now()}`,
        content: reply,
        author: {
          _id: user._id,
          name: user.name
        },
        createdAt: new Date().toISOString()
      };
      
      const updatedPosts = posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            replies: [...(post.replies || []), newReply]
          };
        }
        return post;
      });
      
      setPosts(updatedPosts);
      setReply('');
      // Keep the post open to show the new reply
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
      // For Vercel deployment, simulate liking a post
      const updatedPosts = posts.map(post => {
        if (post._id === postId) {
          // Check if user already liked the post
          const userLiked = post.likes.includes(user._id);
          let updatedLikes;
          
          if (userLiked) {
            // Unlike: remove user from likes
            updatedLikes = post.likes.filter(id => id !== user._id);
          } else {
            // Like: add user to likes
            updatedLikes = [...post.likes, user._id];
          }
          
          return {
            ...post,
            likes: updatedLikes
          };
        }
        return post;
      });
      
      setPosts(updatedPosts);
    } catch (err) {
      console.error('Error liking post:', err)
    }
  }

  const categories = [
    {
      icon: <MdPets className="w-6 h-6" />,
      name: "Pet Care",
      description: "Tips and advice for pet care",
      color: "#4F959D"
    },
    {
      icon: <FaHeart className="w-6 h-6" />,
      name: "Pet Health",
      description: "Discuss pet health concerns",
      color: "#205781"
    },
    {
      icon: <FaPaw className="w-6 h-6" />,
      name: "Training",
      description: "Share training experiences",
      color: "#98D2C0"
    },
    {
      icon: <FaComments className="w-6 h-6" />,
      name: "General Discussion",
      description: "Chat about anything pet-related",
      color: "#F6F8D5"
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
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#4F959D]"></div>
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
      <motion.section 
        className="relative py-16 bg-[#F6F8D5]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="max-w-7xl mx-auto px-4 text-center"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            variants={fadeInUp}
          >
            Pet <span className="text-[#4F959D]">Community Forum</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto mb-8"
            variants={fadeInUp}
          >
            Connect with fellow pet lovers, share experiences, and learn from our community
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            className="max-w-2xl mx-auto relative"
            variants={fadeInUp}
          >
            <input
              type="text"
              placeholder="Search discussions..."
              className="w-full px-6 py-4 rounded-full bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-[#4F959D] pl-14"
            />
            <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Main Content */}
      <motion.section 
        className="py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Sidebar */}
            <motion.div 
              className="w-full md:w-64 space-y-6"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="w-full bg-[#4F959D] text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg"
              >
                <FaPlus />
                New Discussion
              </motion.button>

              <div className="bg-[#F6F8D5] rounded-xl shadow-lg p-6">
                <h3 className="font-semibold mb-4">Categories</h3>
                <motion.div 
                  className="space-y-2"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {categories.map((category) => (
                    <motion.button
                      key={category.name}
                      onClick={() => setActiveCategory(category.name)}
                      className={`w-full text-left px-4 py-2 rounded-lg capitalize ${
                        activeCategory === category.name
                          ? 'bg-[#4F959D] text-white'
                          : 'hover:bg-gray-100'
                      }`}
                      variants={fadeInUp}
                      whileHover={{ x: 5 }}
                    >
                      {category.name}
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div 
              className="flex-1"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Recent Discussions</h2>
                  <select className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4F959D]">
                    <option>Most Recent</option>
                    <option>Most Popular</option>
                    <option>Most Commented</option>
                  </select>
                </div>

                <motion.div 
                  className="space-y-4"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {posts.map((post) => (
                    <motion.div
                      key={post._id}
                      className="bg-[#F6F8D5] p-6 rounded-xl shadow-lg"
                      variants={cardVariants}
                      whileHover="hover"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{post.author?.name || 'Anonymous'}</span>
                            <span className="px-2 py-1 bg-gray-100 rounded-full capitalize">
                              {post.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-gray-500">
                        <motion.button 
                          className="flex items-center gap-2"
                          whileHover={{ scale: 1.1, color: '#205781' }}
                          onClick={() => handleLike(post._id)}
                        >
                          <FaHeart />
                          <span>{post.likes?.length || 0}</span>
                        </motion.button>
                        <motion.button 
                          className="flex items-center gap-2"
                          whileHover={{ scale: 1.1, color: '#4F959D' }}
                          onClick={() => setSelectedPost(selectedPost === post._id ? null : post._id)}
                        >
                          <FaComment />
                          <span>{post.replies?.length || 0}</span>
                        </motion.button>
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
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F959D] h-24"
                              />
                              <div className="mt-2 flex justify-end">
                                <button
                                  onClick={() => handleAddReply(post._id)}
                                  className="px-4 py-2 bg-[#4F959D] text-white rounded-lg hover:bg-[#4F959D]/90"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <button
                                onClick={() => router.push('/login')}
                                className="text-[#4F959D] hover:underline"
                              >
                                Login to reply
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      {!user && (
        <section className="py-16 bg-gradient-to-r from-[#4F959D] to-[#205781]">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold text-white mb-6">
              Join Our Growing Community
            </h2>
            <p className="text-white/90 mb-8 text-lg">
              Share your pet stories, get advice, and connect with other pet lovers
            </p>
            <button 
              onClick={() => router.push('/register')}
              className="bg-white text-[#4F959D] px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-[#F6F8D5]"
            >
              Create Account
            </button>
          </div>
        </section>
      )}
    </>
  )
}