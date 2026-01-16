import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        setSubmitted(true);
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-sm">
                        <div className="card-body p-4">
                            <h2 className="text-center mb-4">Forgot Password</h2>

                            {!submitted ? (
                                <form onSubmit={handleSubmit}>
                                    <p className="text-muted text-center mb-4">
                                        Enter your email address and we'll send you a link to reset your password.
                                    </p>
                                    <div className="mb-3">
                                        <label className="form-label">Email address</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="d-grid gap-2">
                                        <button type="submit" className="btn btn-primary">
                                            Send Reset Link
                                        </button>
                                    </div>
                                    <div className="mt-3 text-center">
                                        <Link to="/login">Back to Login</Link>
                                    </div>
                                </form>
                            ) : (
                                <div className="text-center">
                                    <div className="alert alert-success">
                                        If an account with that email exists, we have sent a password reset link.
                                    </div>
                                    <Link to="/login" className="btn btn-outline-primary">Back to Login</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
