import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ isAuthenticated, handleLogout }) => {
    const navigate = useNavigate();

    const onLogout = () => {
        handleLogout();
        navigate('/login');
    };

    return (
        <nav className='bg-slate-800 text-white '>
            <div className="mycontainer flex justify-between items-center px-4 py-5 h-14">

                <div className="logo font-bold text-white text-2xl">
                    <Link to='/'>
                        <span className='text-green-500'> &lt;</span>
                        <span>Pass</span><span className='text-green-500'>OP/&gt;</span>
                    </Link>
                </div>
                <div>
                    {isAuthenticated ? (
                        <button onClick={onLogout} className='text-white bg-green-700 my-5 mx-2 rounded-full flex justify-between items-center ring-white ring-1'>
                            <span className='font-bold px-4'>Logout</span>
                        </button>
                    ) : (
                        <div className='flex gap-4'>
                            <Link to="/login">
                                <button className='text-white bg-green-700 my-5 mx-2 rounded-full flex justify-between items-center ring-white ring-1'>
                                    <span className='font-bold px-4'>Login</span>
                                </button>
                            </Link>
                            <Link to="/register">
                                <button className='text-white bg-green-700 my-5 mx-2 rounded-full flex justify-between items-center ring-white ring-1'>
                                    <span className='font-bold px-4'>Register</span>
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar
