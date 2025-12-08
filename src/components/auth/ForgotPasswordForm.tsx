'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  User, 
  Clock,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface ContactPerson {
  name: string;
  role: string;
  phone: string;
  email: string;
  availableHours: string;
}

export default function ForgotPasswordForm() {
  const [showSuccess, setShowSuccess] = useState(false);

  // Contact persons information
  const contactPersons: ContactPerson[] = [
    {
      name: 'Admin IT Support',
      role: 'Application Developer',
      phone: '+62 813-5894-5230',
      email: 'muhammadismail2418@gmail.com',
      availableHours: 'Monday - Friday, 08:00 - 18:00 WIB',
    },
  ];

  const handleContactClick = (phone: string) => {
    // Format phone number for WhatsApp (remove + and spaces)
    const formattedPhone = phone.replace(/[\s+-]/g, '');
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-8 text-white">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-white p-4 rounded-2xl shadow-lg">
            <Image 
              src="/favicon.ico" 
              alt="ASB Logo" 
              width={64} 
              height={64}
              className="h-16 w-16"
            />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">
          Password Assistance
        </h1>
        <p className="text-teal-100 text-center text-sm">
          Get help resetting your password
        </p>
      </div>

      {/* Content Section */}
      <div className="p-8">
        {!showSuccess ? (
          <>
            {/* Back to Sign In Link */}
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Kembali ke Login</span>
            </Link>

            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Lupa Password?
            </h2>
            <p className="text-gray-600 mb-6">
              Jangan khawatir! Hubungi tim dukungan IT untuk membantu Anda mengatur ulang password Anda.
            </p>

            {/* Information Box */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-teal-800">
                <strong>Penting:</strong> Untuk alasan keamanan, pengaturan ulang password harus dilakukan oleh tim dukungan IT. 
                Hubungi mereka menggunakan informasi di bawah ini.
              </p>
            </div>

            {/* Contact Persons */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Phone className="h-5 w-5 text-teal-600" />
                Contact Support
              </h3>

              {contactPersons.map((person, index) => (
                <div 
                  key={index}
                  className="border border-gray-200 rounded-lg p-5 hover:border-teal-300 hover:shadow-md transition-all"
                >
                  {/* Person Info */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-teal-100 p-2 rounded-lg">
                      <User className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{person.name}</h4>
                      <p className="text-sm text-gray-600">{person.role}</p>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-3">
                    {/* Phone */}
                    <button
                      onClick={() => handleContactClick(person.phone)}
                      className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-teal-50 transition-colors group text-left"
                    >
                      <Phone className="h-4 w-4 text-gray-600 group-hover:text-teal-600" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-0.5">Phone / WhatsApp</p>
                        <p className="text-sm font-medium text-gray-800 group-hover:text-teal-600">
                          {person.phone}
                        </p>
                      </div>
                    </button>

                    {/* Email */}
                    <button
                      onClick={() => handleEmailClick(person.email)}
                      className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-teal-50 transition-colors group text-left"
                    >
                      <Mail className="h-4 w-4 text-gray-600 group-hover:text-teal-600" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-0.5">Email</p>
                        <p className="text-sm font-medium text-gray-800 group-hover:text-teal-600">
                          {person.email}
                        </p>
                      </div>
                    </button>

                    {/* Available Hours */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Clock className="h-4 w-4 text-gray-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-0.5">Available</p>
                        <p className="text-sm text-gray-700">{person.availableHours}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 rounded-lg p-5">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-teal-600" />
                Apa yang perlu Anda persiapkan
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold mt-0.5">•</span>
                  <span>Username yang terdaftar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold mt-0.5">•</span>
                  <span>Role yang terdaftar (misal: Admin, OPD, Verifikator)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold mt-0.5">•</span>
                  <span>Departemen yang terdaftar</span>
                </li>
              </ul>
            </div>

            {/* Alternative Action Button */}
            <div className="mt-6">
              <button
                onClick={() => setShowSuccess(true)}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-teal-500/30"
              >
                Sudah Menkontak Support
              </button>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="text-center py-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Request Submitted
            </h2>
            <p className="text-gray-600 mb-6">
              Our support team will assist you shortly. Please check your email or phone for updates.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-teal-700 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-teal-500/30"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}