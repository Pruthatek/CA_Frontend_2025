import React, { act, useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from '../MainPage/SideBar';
import TopBar from '../MainPage/TopBar';


const Layout = () => {
    const [active, setActive] = useState("");

    return (
        <div className='flex w-full h-screen'>
            {/* Sidebar */}
            <SideBar active={active} setActive={setActive} />
            
            {/* Main content area */}
            <div className='w-[95%] '>
                <TopBar active={active} setActive={setActive}/>
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
