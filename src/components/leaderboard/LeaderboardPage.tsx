import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { 
  TrophyIcon, 
  FireIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

// Enhanced leaderboard data with more students
const extendedLeaderboardData = [
  {
    id: '1',
    name: 'Ahan Kumar',
    class: 'Class 8',
    accuracy: 96,
    points: 830,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rank: 1,
    lessonsCompleted: 68,
    timeSpent: '145 hrs',
    streak: 15,
    badges: ['🏆', '🔥', '⚡'],
    joinedDate: '2024-01-15',
    monthlyRank: 1,
    totalXP: 8300
  },
  {
    id: '2',
    name: 'Hvff',
    class: 'Class 7',
    accuracy: 94,
    points: 295,
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e7?w=150&h=150&fit=crop&crop=face',
    rank: 2,
    lessonsCompleted: 45,
    timeSpent: '98 hrs',
    streak: 12,
    badges: ['🥈', '💪'],
    joinedDate: '2024-01-20',
    monthlyRank: 2,
    totalXP: 2950
  },
  {
    id: '3',
    name: 'Flower Girl',
    class: 'Class 6',
    accuracy: 93,
    points: 190,
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    rank: 3,
    lessonsCompleted: 38,
    timeSpent: '85 hrs',
    streak: 8,
    badges: ['🥉', '🌸'],
    joinedDate: '2024-02-01',
    monthlyRank: 3,
    totalXP: 1900
  },
  {
    id: '4',
    name: '12 June Child Test',
    class: 'Class 5',
    accuracy: 92,
    points: 165,
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rank: 4,
    lessonsCompleted: 32,
    timeSpent: '78 hrs',
    streak: 6,
    badges: ['⭐', '📚'],
    joinedDate: '2024-06-12',
    monthlyRank: 4,
    totalXP: 1650
  },
  {
    id: '5',
    name: 'Hcdff',
    class: 'Class 4',
    accuracy: 91,
    points: 160,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    rank: 5,
    lessonsCompleted: 30,
    timeSpent: '72 hrs',
    streak: 5,
    badges: ['⭐', '🎯'],
    joinedDate: '2024-02-15',
    monthlyRank: 5,
    totalXP: 1600
  },
  {
    id: '6',
    name: 'Eva',
    class: 'Class 3',
    accuracy: 90,
    points: 145,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    rank: 6,
    lessonsCompleted: 28,
    timeSpent: '68 hrs',
    streak: 4,
    badges: ['⭐', '💫'],
    joinedDate: '2024-02-20',
    monthlyRank: 6,
    totalXP: 1450
  },
  // Additional students beyond top 10
  {
    id: '11',
    name: 'Alex Thompson',
    class: 'Class 7',
    accuracy: 85,
    points: 118,
    photo: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=150&h=150&fit=crop&crop=face',
    rank: 11,
    lessonsCompleted: 25,
    timeSpent: '58 hrs',
    streak: 3,
    badges: ['🌟'],
    joinedDate: '2024-03-01',
    monthlyRank: 11,
    totalXP: 1180
  },
  {
    id: '12',
    name: 'Maya Singh',
    class: 'Class 6',
    accuracy: 84,
    points: 115,
    photo: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=150&h=150&fit=crop&crop=face',
    rank: 12,
    lessonsCompleted: 23,
    timeSpent: '55 hrs',
    streak: 2,
    badges: ['🌟'],
    joinedDate: '2024-03-05',
    monthlyRank: 12,
    totalXP: 1150
  }
]

export function LeaderboardPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [timeFrame, setTimeFrame] = useState<string>('monthly')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  const filteredStudents = extendedLeaderboardData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.class.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = selectedClass === 'all' || student.class === selectedClass
    return matchesSearch && matchesClass
  })

  const getPerformanceColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30'
    if (accuracy >= 80) return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30'
    if (accuracy >= 70) return 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30'
    return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/30'
  }

  const getRankBackgroundColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
    if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-600'
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600'
    return 'bg-gradient-to-r from-blue-400 to-blue-600'
  }

  const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8']

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold gradient-text flex items-center">
            <TrophyIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mr-2 sm:mr-3 text-amber-500 flex-shrink-0" />
            <span className="break-words">🏆 School Leaderboard</span>
          </h1>
          <p className="mt-1 sm:mt-2 text-secondary-600 dark:text-secondary-300 text-xs sm:text-sm lg:text-base">
            Celebrating our top performers and encouraging healthy competition
          </p>
        </div>
        <div className="flex-shrink-0">
          <div className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-300 bg-white/80 dark:bg-black/30 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg lg:rounded-xl backdrop-blur-sm border border-secondary-200 dark:border-white/10">
            Updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
        <Card className="animate-slide-up overflow-hidden">
        <CardHeader className="bg-white dark:from-black/30 dark:to-black/20 border-b border-secondary-200 dark:border-white/10 p-3 sm:p-4 lg:p-6">
          <CardTitle gradient className="text-base sm:text-lg lg:text-xl text-center">
            🥇 Champions Podium 🥇
          </CardTitle>
          <p className="text-xs sm:text-sm text-center text-amber-700 mt-1">This month's top 3 achievers</p>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-end md:justify-center md:space-y-0 md:space-x-4 lg:space-x-8">
            {/* 2nd Place */}
            {filteredStudents[1] && (
              <div className="flex flex-col items-center order-2 md:order-1">
                <div className="relative mb-3 sm:mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-gray-400 overflow-hidden shadow-lg">
                    <img src={filteredStudents[1].photo} alt={filteredStudents[1].name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -top-2 -right-2 text-xl sm:text-2xl">🥈</div>
                </div>
                <div className="bg-gradient-to-t from-gray-400 to-gray-500 text-white px-4 sm:px-6 py-6 sm:py-8 rounded-t-xl text-center min-h-[100px] sm:min-h-[120px] flex flex-col justify-end w-full max-w-[200px]">
                  <h3 className="font-bold text-xs sm:text-sm mb-1 truncate">{filteredStudents[1].name}</h3>
                  <p className="text-xs opacity-90 mb-2">{filteredStudents[1].class}</p>
                  <p className="text-base sm:text-lg font-bold">{filteredStudents[1].points} pts</p>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {filteredStudents[0] && (
              <div className="flex flex-col items-center order-1 md:order-2">
                <div className="relative mb-3 sm:mb-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-yellow-400 overflow-hidden shadow-xl animate-pulse">
                    <img src={filteredStudents[0].photo} alt={filteredStudents[0].name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3 text-2xl sm:text-3xl">🏆</div>
                </div>
                <div className="bg-gradient-to-t from-yellow-400 to-yellow-500 text-white px-4 sm:px-6 py-8 sm:py-10 rounded-t-xl text-center min-h-[120px] sm:min-h-[140px] flex flex-col justify-end w-full max-w-[200px]">
                  <h3 className="font-bold text-sm sm:text-base mb-1 truncate">{filteredStudents[0].name}</h3>
                  <p className="text-xs opacity-90 mb-2">{filteredStudents[0].class}</p>
                  <p className="text-lg sm:text-xl font-bold">{filteredStudents[0].points} pts</p>
                  <div className="flex justify-center mt-2 space-x-1">
                    {filteredStudents[0].badges.map((badge: string, idx: number) => (
                      <span key={idx} className="text-xs sm:text-sm">{badge}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {filteredStudents[2] && (
              <div className="flex flex-col items-center order-3 md:order-3">
                <div className="relative mb-3 sm:mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-orange-400 overflow-hidden shadow-lg">
                    <img src={filteredStudents[2].photo} alt={filteredStudents[2].name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -top-2 -right-2 text-xl sm:text-2xl">🥉</div>
                </div>
                <div className="bg-gradient-to-t from-orange-400 to-orange-500 text-white px-4 sm:px-6 py-6 sm:py-8 rounded-t-xl text-center min-h-[100px] sm:min-h-[120px] flex flex-col justify-end w-full max-w-[200px]">
                  <h3 className="font-bold text-xs sm:text-sm mb-1 truncate">{filteredStudents[2].name}</h3>
                  <p className="text-xs opacity-90 mb-2">{filteredStudents[2].class}</p>
                  <p className="text-base sm:text-lg font-bold">{filteredStudents[2].points} pts</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-4">
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 border border-secondary-200 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-black/30 dark:text-white w-full sm:w-auto sm:min-w-[120px]"
              >
                <option value="all">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <select 
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value)}
                className="px-3 py-2 border border-secondary-200 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-black/30 dark:text-white w-full sm:w-auto sm:min-w-[120px]"
              >
                <option value="monthly">This Month</option>
                <option value="weekly">This Week</option>
                <option value="alltime">All Time</option>
              </select>
              <Button variant="outline" className="flex items-center justify-center w-full sm:w-auto text-sm">
                <FunnelIcon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">More Filters</span>
                <span className="sm:hidden">Filters</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <CardTitle gradient className="text-base sm:text-lg lg:text-xl">Complete Rankings</CardTitle>
            <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-300 mt-1">All students ranked by points earned this month</p>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="space-y-2 sm:space-y-3">
            {filteredStudents.map((student) => (
               <div key={student.id} className={`flex items-center p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-[1.01] ${
                student.rank <= 3 
                  ? 'bg-white dark:from-black/30 dark:to-black/20 border-2 border-secondary-200 dark:border-white/10' 
                  : 'bg-white dark:bg-black/20 border border-secondary-200 dark:border-white/10'
               }`}>
                {/* Rank */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold mr-3 sm:mr-4 flex-shrink-0 ${getRankBackgroundColor(student.rank)}`}>
                  {student.rank <= 3 ? 
                    <span className="text-sm sm:text-lg">{student.rank === 1 ? '🏆' : student.rank === 2 ? '🥈' : '🥉'}</span> :
                    <span className="text-xs sm:text-sm">#{student.rank}</span>
                  }
                </div>

                {/* Student Photo */}
                <div className="relative mr-3 sm:mr-4 flex-shrink-0">
                  <img 
                    src={student.photo} 
                    alt={student.name}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ${
                      student.rank <= 3 ? 'border-2 sm:border-3 border-amber-400' : 'border-2 border-secondary-300'
                    }`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=3b82f6&color=fff&size=100`;
                    }}
                  />
                  {student.streak > 7 && (
                    <div className="absolute -top-1 -right-1 text-xs">🔥</div>
                  )}
                </div>

                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm sm:text-base text-secondary-900 dark:text-white truncate">{student.name}</h3>
                      <p className="text-xs sm:text-sm text-secondary-600">{student.class}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4">
                      <div className="text-center">
                        <p className="text-sm sm:text-lg font-bold text-amber-600">{student.points}</p>
                        <p className="text-xs text-secondary-500">points</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(student.accuracy)}`}>
                        {student.accuracy}%
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-secondary-600">
                        <FireIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-orange-500" />
                        {student.streak}
                      </div>
                    </div>
                  </div>
                  
                  {/* Badges and Details Button */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex space-x-1">
                      {student.badges.map((badge: string, idx: number) => (
                        <span key={idx} className="text-xs sm:text-sm">{badge}</span>
                      ))}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedStudent(student)}
                      className="text-xs px-2 py-1 sm:px-3 sm:py-1.5"
                    >
                      <EyeIcon className="w-3 h-3 mr-1" />
                      <span className="hidden xs:inline">Details</span>
                      <span className="xs:hidden">View</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">👑</div>
            <p className="text-xs sm:text-sm font-bold text-secondary-900 dark:text-white">Current Champion</p>
            <p className="text-xs text-secondary-600 truncate">Ahan Kumar</p>
            <p className="text-sm sm:text-lg font-bold text-amber-600">830 points</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🔥</div>
            <p className="text-xs sm:text-sm font-bold text-secondary-900 dark:text-white">Longest Streak</p>
            <p className="text-xs text-secondary-600 truncate">Ahan Kumar</p>
            <p className="text-sm sm:text-lg font-bold text-orange-600">15 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">⚡</div>
            <p className="text-xs sm:text-sm font-bold text-secondary-900 dark:text-white">Most Active</p>
            <p className="text-xs text-secondary-600 truncate">Ahan Kumar</p>
            <p className="text-sm sm:text-lg font-bold text-blue-600">68 lessons</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🎯</div>
            <p className="text-xs sm:text-sm font-bold text-secondary-900 dark:text-white">Highest Accuracy</p>
            <p className="text-xs text-secondary-600 truncate">Ahan Kumar</p>
            <p className="text-sm sm:text-lg font-bold text-green-600">96%</p>
          </CardContent>
        </Card>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0 mb-4 sm:mb-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <img 
                  src={selectedStudent.photo} 
                  alt={selectedStudent.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-amber-400 shadow-lg"
                />
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-secondary-900 dark:text-white">{selectedStudent.name}</h2>
                  <p className="text-sm sm:text-base text-secondary-600">{selectedStudent.class}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <div className={`px-2 sm:px-3 py-1 rounded-full text-white font-bold text-xs sm:text-sm ${getRankBackgroundColor(selectedStudent.rank)}`}>
                      Rank #{selectedStudent.rank}
                    </div>
                    <div className="flex space-x-1">
                      {selectedStudent.badges.map((badge: string, idx: number) => (
                        <span key={idx} className="text-sm sm:text-lg">{badge}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedStudent(null)} className="w-full sm:w-auto">
                Close
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="p-3 sm:p-4">
                  <CardTitle className="text-sm sm:text-base">Performance Stats</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-secondary-500">Points This Month</p>
                      <p className="text-2xl sm:text-3xl font-bold text-amber-600">{selectedStudent.points}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-secondary-500">Overall Accuracy</p>
                      <p className="text-2xl sm:text-3xl font-bold text-green-600">{selectedStudent.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-secondary-500">Current Streak</p>
                      <p className="text-2xl sm:text-3xl font-bold text-orange-600">{selectedStudent.streak} days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 sm:p-4">
                  <CardTitle className="text-sm sm:text-base">Learning Progress</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-secondary-500">Lessons Completed</p>
                      <p className="text-2xl sm:text-3xl font-bold text-blue-600">{selectedStudent.lessonsCompleted}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-secondary-500">Time Spent</p>
                      <p className="text-2xl sm:text-3xl font-bold text-purple-600">{selectedStudent.timeSpent}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-secondary-500">Total XP</p>
                      <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{selectedStudent.totalXP.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
