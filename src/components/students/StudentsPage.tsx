import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { EyeIcon } from '@heroicons/react/24/outline'
import type { Student } from '../../types'

const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Ahan Kumar',
    class: 'Class 8',
    schoolId: '1',
    enrollmentDate: '2024-01-15',
    performance: {
      accuracyPercentage: 96,
      lessonsCompleted: 68,
      timeSpentMinutes: 8700, // 145 hrs
      xpPoints: 830,
      skillAreas: {
        vocabulary: 98,
        grammar: 96,
        pronunciation: 94,
        listening: 97,
        speaking: 95
      }
    }
  },
  {
    id: '2',
    name: 'Hvff',
    class: 'Class 7',
    schoolId: '1',
    enrollmentDate: '2024-01-20',
    performance: {
      accuracyPercentage: 94,
      lessonsCompleted: 45,
      timeSpentMinutes: 5880, // 98 hrs
      xpPoints: 295,
      skillAreas: {
        vocabulary: 96,
        grammar: 94,
        pronunciation: 92,
        listening: 95,
        speaking: 93
      }
    }
  },
  {
    id: '3',
    name: 'Flower Girl',
    class: 'Class 6',
    schoolId: '1',
    enrollmentDate: '2024-02-01',
    performance: {
      accuracyPercentage: 93,
      lessonsCompleted: 38,
      timeSpentMinutes: 5100, // 85 hrs
      xpPoints: 190,
      skillAreas: {
        vocabulary: 95,
        grammar: 93,
        pronunciation: 91,
        listening: 94,
        speaking: 92
      }
    }
  },
  {
    id: '4',
    name: '12 June Child Test',
    class: 'Class 5',
    schoolId: '1',
    enrollmentDate: '2024-06-12',
    performance: {
      accuracyPercentage: 92,
      lessonsCompleted: 32,
      timeSpentMinutes: 4680, // 78 hrs
      xpPoints: 165,
      skillAreas: {
        vocabulary: 94,
        grammar: 92,
        pronunciation: 90,
        listening: 93,
        speaking: 91
      }
    }
  },
  {
    id: '5',
    name: 'Hcdff',
    class: 'Class 4',
    schoolId: '1',
    enrollmentDate: '2024-02-15',
    performance: {
      accuracyPercentage: 91,
      lessonsCompleted: 30,
      timeSpentMinutes: 4320, // 72 hrs
      xpPoints: 160,
      skillAreas: {
        vocabulary: 93,
        grammar: 91,
        pronunciation: 89,
        listening: 92,
        speaking: 90
      }
    }
  },
  {
    id: '6',
    name: 'Eva',
    class: 'Class 3',
    schoolId: '1',
    enrollmentDate: '2024-02-20',
    performance: {
      accuracyPercentage: 90,
      lessonsCompleted: 28,
      timeSpentMinutes: 4080, // 68 hrs
      xpPoints: 145,
      skillAreas: {
        vocabulary: 92,
        grammar: 90,
        pronunciation: 88,
        listening: 91,
        speaking: 89
      }
    }
  },
  {
    id: '7',
    name: 'Sophia Kim',
    class: 'Class 2',
    schoolId: '1',
    enrollmentDate: '2024-02-25',
    performance: {
      accuracyPercentage: 89,
      lessonsCompleted: 26,
      timeSpentMinutes: 3900, // 65 hrs
      xpPoints: 138,
      skillAreas: {
        vocabulary: 91,
        grammar: 89,
        pronunciation: 87,
        listening: 90,
        speaking: 88
      }
    }
  },
  {
    id: '8',
    name: 'James Wilson',
    class: 'Class 6',
    schoolId: '1',
    enrollmentDate: '2024-03-01',
    performance: {
      accuracyPercentage: 88,
      lessonsCompleted: 24,
      timeSpentMinutes: 3480, // 58 hrs
      xpPoints: 132,
      skillAreas: {
        vocabulary: 90,
        grammar: 88,
        pronunciation: 86,
        listening: 89,
        speaking: 87
      }
    }
  },
  {
    id: '9',
    name: 'Olivia Davis',
    class: 'Class 5',
    schoolId: '1',
    enrollmentDate: '2024-03-05',
    performance: {
      accuracyPercentage: 87,
      lessonsCompleted: 22,
      timeSpentMinutes: 3300, // 55 hrs
      xpPoints: 128,
      skillAreas: {
        vocabulary: 89,
        grammar: 87,
        pronunciation: 85,
        listening: 88,
        speaking: 86
      }
    }
  },
  {
    id: '10',
    name: 'Liam Garcia',
    class: 'Class 1',
    schoolId: '1',
    enrollmentDate: '2024-03-10',
    performance: {
      accuracyPercentage: 86,
      lessonsCompleted: 20,
      timeSpentMinutes: 3120, // 52 hrs
      xpPoints: 120,
      skillAreas: {
        vocabulary: 88,
        grammar: 86,
        pronunciation: 84,
        listening: 87,
        speaking: 85
      }
    }
  },
  {
    id: '11',
    name: 'Alex Thompson',
    class: 'Class 7',
    schoolId: '1',
    enrollmentDate: '2024-03-01',
    performance: {
      accuracyPercentage: 85,
      lessonsCompleted: 25,
      timeSpentMinutes: 3480, // 58 hrs
      xpPoints: 118,
      skillAreas: {
        vocabulary: 87,
        grammar: 85,
        pronunciation: 83,
        listening: 86,
        speaking: 84
      }
    }
  },
  {
    id: '12',
    name: 'Maya Singh',
    class: 'Class 6',
    schoolId: '1',
    enrollmentDate: '2024-03-05',
    performance: {
      accuracyPercentage: 84,
      lessonsCompleted: 23,
      timeSpentMinutes: 3300, // 55 hrs
      xpPoints: 115,
      skillAreas: {
        vocabulary: 86,
        grammar: 84,
        pronunciation: 82,
        listening: 85,
        speaking: 83
      }
    }
  },
  {
    id: '13',
    name: 'Ava Martinez',
    class: 'Class 3',
    schoolId: '1',
    enrollmentDate: '2024-01-15',
    performance: {
      accuracyPercentage: 85,
      lessonsCompleted: 45,
      timeSpentMinutes: 6480, // 108 hrs
      xpPoints: 4100,
      skillAreas: {
        vocabulary: 87,
        grammar: 85,
        pronunciation: 83,
        listening: 86,
        speaking: 84
      }
    }
  },
  {
    id: '14',
    name: 'Noah Thompson',
    class: 'Class 4',
    schoolId: '1',
    enrollmentDate: '2024-01-20',
    performance: {
      accuracyPercentage: 83,
      lessonsCompleted: 42,
      timeSpentMinutes: 6120, // 102 hrs
      xpPoints: 3950,
      skillAreas: {
        vocabulary: 85,
        grammar: 83,
        pronunciation: 81,
        listening: 84,
        speaking: 82
      }
    }
  }
]

export function StudentsPage() {
  const [students] = useState<Student[]>(mockStudents)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Students Management</h1>
      </div>

      {/* Search */}
      <Card>
        <CardContent>
          <Input
            placeholder="Search students by name or class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">All Students ({filteredStudents.length})</CardTitle>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Complete list of enrolled students with performance metrics</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white dark:bg-black/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accuracy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lessons
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    XP Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-black/20 divide-y divide-gray-200 dark:divide-white/10">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
                        <div className="text-sm text-gray-500">
                          Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-secondary-200">
                      {student.class}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getPerformanceColor(student.performance.accuracyPercentage)}`}>
                        {student.performance.accuracyPercentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-secondary-200">
                      {student.performance.lessonsCompleted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {student.performance.xpPoints.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{selectedStudent.name}</h2>
              <Button variant="outline" onClick={() => setSelectedStudent(null)} className="w-full sm:w-auto">
                Close
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Class</p>
                      <p className="text-sm text-gray-900 dark:text-secondary-200">{selectedStudent.class}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Enrollment Date</p>
                      <p className="text-sm text-gray-900 dark:text-secondary-200">
                        {new Date(selectedStudent.enrollmentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Time Spent</p>
                      <p className="text-sm text-gray-900 dark:text-secondary-200">
                        {Math.round(selectedStudent.performance.timeSpentMinutes / 60)} hours
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Overall Accuracy</p>
                      <p className={`text-lg font-semibold ${getPerformanceColor(selectedStudent.performance.accuracyPercentage)}`}>
                        {selectedStudent.performance.accuracyPercentage}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Lessons Completed</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedStudent.performance.lessonsCompleted}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">XP Points</p>
                      <p className="text-lg font-semibold text-primary-600">
                        {selectedStudent.performance.xpPoints.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skill Areas */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Skill Areas Performance</CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Individual performance across different language skills</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {Object.entries(selectedStudent.performance.skillAreas).map(([skill, score]) => (
                      <div key={skill} className="text-center">
                        <div className="mb-2">
                          <div className={`text-2xl font-bold ${getPerformanceColor(score)}`}>
                            {score}%
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-700 capitalize">
                          {skill}
                        </p>
                      </div>
                    ))}
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
