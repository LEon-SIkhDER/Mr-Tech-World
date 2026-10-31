'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import toast from 'react-hot-toast';
import { authClient } from '../lib/auth-client';

const SignIn = () => {
    const router = useRouter()
    const handleSingIn = async (e) => {
        e.preventDefault()
        const formData = Object.fromEntries(new FormData(e.target))
        formData.rememberMe = formData.remember === "on"
        delete formData.remember
        const { data, error } = await authClient.signIn.email(formData);

        if (error) {
            toast.error(error.message || error.statusText || "Something went wrong")
        }
        if (data) {
            router.push("/")
        }
        console.log(data, error);
    }
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Card */}
                <div className="card bg-base-100 shadow-xl border border-base-200">
                    <div className="card-body p-8 gap-0">

                        {/* Header */}
                        <div className="flex flex-col items-center mb-8 gap-3">
                            <div className="p-1 rounded-2xl shadow-sm">
                                <Image src="/logo.jpeg" alt="Mr Tech World Logo" width={56} height={56} className="rounded-xl" />
                            </div>
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-base-content tracking-tight">Welcome back</h1>
                                <p className="text-sm text-base-content/50 mt-1">Sign in to your account</p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSingIn} className="space-y-4">

                            {/* Email */}
                            <div className="form-control gap-1.5">
                                <label className="label py-0" htmlFor="email">
                                    <span className="label-text text-sm font-medium text-base-content/80">Email Address</span>
                                </label>
                                <input id="email" name="email" type="email" placeholder="john@example.com" className="input input-bordered w-full focus:border-violet-400 focus:outline-none transition-colors duration-150" required />
                            </div>

                            {/* Password & Forgot Password */}
                            <div className="form-control gap-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="label py-0" htmlFor="password">
                                        <span className="label-text text-sm font-medium text-base-content/80">Password</span>
                                    </label>
                                    <Link href="/forgot-password" className="text-xs text-violet-600 font-medium hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <input id="password" name="password" type="password" placeholder="Enter your password" className="input input-bordered w-full focus:border-violet-400 focus:outline-none transition-colors duration-150" required />
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="remember" className="checkbox checkbox-sm checkbox-primary rounded" />
                                    <span className="text-xs text-base-content/70">Remember me</span>
                                </label>
                            </div>

                            {/* Submit */}
                            <button type="submit" className="btn w-full bg-violet-600 hover:bg-violet-700 text-white border-none shadow-sm mt-2">
                                Sign In
                            </button>
                        </form>





                    </div>
                </div>

                {/* Footer note */}
                <p className="text-center text-xs text-base-content/30 mt-6">
                    © {new Date().getFullYear()} Mr Tech World. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default SignIn;
