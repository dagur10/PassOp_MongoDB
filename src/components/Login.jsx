import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ handleLogin }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        const json = await response.json();
        if (json.token) {
            localStorage.setItem('token', json.token);
            handleLogin();
            navigate('/');
        } else {
            alert('Invalid credentials');
        }
    };

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    return (
        <div className="p-3 md:mycontainer min-h-[88.2vh]">
            <h1 className='text-4xl text font-bold text-center'>
                <span className='text-green-500'> &lt;</span>
                <span>Pass</span><span className='text-green-500'>OP/&gt;</span>
            </h1>
            <p className='text-green-900 text-lg text-center'>Login to your account</p>

            <div className="flex flex-col p-4 text-black gap-8 items-center">
                <form onSubmit={handleSubmit} className="flex flex-col gap-8 items-center w-full">
                    <input
                        value={credentials.username}
                        onChange={onChange}
                        placeholder='Enter Username'
                        className='rounded-full border border-green-500 w-full p-4 py-1'
                        type="text"
                        name="username"
                        required
                    />
                    <input
                        value={credentials.password}
                        onChange={onChange}
                        placeholder='Enter Password'
                        className='rounded-full border border-green-500 w-full p-4 py-1'
                        type="password"
                        name="password"
                        required
                    />
                    <button type="submit" className='flex justify-center items-center gap-2 bg-green-400 hover:bg-green-300 rounded-full px-8 py-2 w-fit border border-green-900'>
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
