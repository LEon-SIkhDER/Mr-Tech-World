import Image from 'next/image';
import React from 'react';

const SignUp = () => {
    return (
        <div className="min-h-screen  flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Card */}
                <div className="card bg-base-100 shadow-xl border border-base-200">
                    <div className="card-body p-8 gap-0">

                        {/* Header */}
                        <div className="flex flex-col items-center mb-8 gap-3">
                            <div className="p-1 rounded-2xl shadow-sm">
                                <Image
                                    src="/logo.jpeg"
                                    alt="Mr Tech World Logo"
                                    width={56}
                                    height={56}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-base-content tracking-tight">Create your account</h1>
                                <p className="text-sm text-base-content/50 mt-1">Join Mr Tech World today</p>
                            </div>
                        </div>

                        {/* Form */}
                        <form className="space-y-4">

                            {/* Full Name */}
                            <div className="form-control gap-1.5">
                                <label className="label py-0" htmlFor="fullName">
                                    <span className="label-text text-sm font-medium text-base-content/80">Full Name</span>
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    placeholder="John Doe"
                                    className="input input-bordered w-full focus:border-violet-400 focus:outline-none transition-colors duration-150"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="form-control gap-1.5">
                                <label className="label py-0" htmlFor="email">
                                    <span className="label-text text-sm font-medium text-base-content/80">Email Address</span>
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    className="input input-bordered w-full focus:border-violet-400 focus:outline-none transition-colors duration-150"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="form-control gap-1.5">
                                <label className="label py-0" htmlFor="password">
                                    <span className="label-text text-sm font-medium text-base-content/80">Password</span>
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Min. 8 characters"
                                    className="input input-bordered w-full focus:border-violet-400 focus:outline-none transition-colors duration-150"
                                    required
                                    minLength={8}
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="form-control gap-1.5">
                                <label className="label py-0" htmlFor="confirmPassword">
                                    <span className="label-text text-sm font-medium text-base-content/80">Confirm Password</span>
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Re-enter your password"
                                    className="input input-bordered w-full focus:border-violet-400 focus:outline-none transition-colors duration-150"
                                    required
                                    minLength={8}
                                />
                            </div>

                            {/* Terms */}
                            <div className="form-control mt-1">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="terms"
                                        className="checkbox checkbox-sm mt-0.5"
                                        required
                                    />
                                    <span className="text-sm text-base-content/60 leading-relaxed">
                                        I agree to the{' '}
                                        <a href="#" className="text-violet-600 font-medium hover:underline">Terms of Service</a>
                                        {' '}and{' '}
                                        <a href="#" className="text-violet-600 font-medium hover:underline">Privacy Policy</a>
                                    </span>
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="btn w-full bg-violet-600 hover:bg-violet-700 text-white border-none shadow-sm mt-2"
                            >
                                Create Account
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="divider text-xs text-base-content/30 my-6">OR</div>

                        {/* Sign-in link */}
                        <p className="text-center text-sm text-base-content/60">
                            Already have an account?{' '}
                            <a href="#" className="text-violet-600 font-semibold hover:underline">Sign in</a>
                        </p>

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

export default SignUp;
