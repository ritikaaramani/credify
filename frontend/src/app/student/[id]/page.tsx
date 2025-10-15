'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  role: string;
  credentials: {
    id: string;
    skills_acquired: string;
    score: number;
    rank: string;
    credential_name: string;
    certificate_url: string;
  }[];
}

export default function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id: studentId } = use(params);

  const fetchStudentProfile = useCallback(async () => {
    try {
      // Fetch user details
      const { data: profile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', studentId)
        .eq('role', 'student')
        .single();

      if (userError) throw userError;

      if (profile) {
        // Fetch credentials for the specific student
        const { data: credentials, error: credError } = await supabase
          .from('credentials')
          .select('*')
          .eq('student_id', profile.id);

        if (credError) throw credError;

        setStudent({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          created_at: profile.created_at,
          role: profile.role,
          credentials: credentials || []
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while fetching student profile');
      }
    } finally {
      setLoading(false);
    }
  }, [studentId]);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">
            {error || 'Student not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>

        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-lg"></div>
          <div className="px-6 pb-6">
            <div className="relative">
              <div className="absolute -top-16 left-4">
                <div className="h-32 w-32 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center">
                  <span className="text-4xl font-medium text-blue-600">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-40 pt-4">
                <h1 className="text-3xl font-semibold text-gray-900">{student.name}</h1>
                <p className="text-gray-600 mt-1">{student.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center text-gray-700">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {student.email}
              </div>
            </div>
            <div>
              <div className="flex items-center text-gray-700">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {student.phone || 'No phone number provided'}
              </div>
            </div>
            <div>
              <div className="flex items-center text-gray-700">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Joined {student.created_at ? new Date(student.created_at).toLocaleDateString('en-US', { 
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                }) : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Credentials Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Certificates & Achievements</h2>
          {student.credentials && student.credentials.length > 0 ? (
            <div className="space-y-6">
              {student.credentials.map((credential) => (
                <div key={credential.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                      <h3 className="text-xl font-semibold text-gray-900">{credential.credential_name}</h3>
                      <p className="mt-2 text-gray-600">{credential.skills_acquired}</p>
                      <div className="mt-3 flex items-center space-x-4">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="ml-2 text-gray-700">Score: {credential.score}</span>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          Rank: {credential.rank}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <a 
                        href={credential.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        View Certificate
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No certificates</h3>
              <p className="mt-1 text-sm text-gray-500">No certificates have been added to this profile yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}