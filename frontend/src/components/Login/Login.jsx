import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
// import useAuth from '../../hooks/useAuth';
// import axios, { axiosPrivate } from '../../api/axios';
// import { login } from '../../services/authService';
import axios from '../../api/axios';
const VITE_APP_SERVER = import.meta.env.VITE_APP_SERVER;

const Login = () => {

////////////////////////////// LOGIN FUNCTIONS START//////////////////////////////  
// const { setAuth } = useAuth();
// const location = useLocation();
// const from = location.state?.from?.pathname || "/";

    const navigate = useNavigate();

    function myFunction() {
        var x = document.getElementById("myInput");
        if (x.type === "password") {
          x.type = "text";
        } else {
          x.type = "password";
        }
      }

      const [credentials, setCredentials] = useState({ email: "", password: "" });
      const [message, setMessage] = useState({ type: "", text: "" });
      const [tab, setTab] = useState("Log In")

          const [formData, setFormData] = useState({
            username: "",
            email: "",
            password: "",
            
        });

        const handleChange2 = (e) => {
          const { name, value} = e.target;
              setFormData({ ...formData, [name]: value });   
        };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/login/', credentials, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      
      const { access, refresh, user_details } = response.data;
      // Store tokens in localStorage
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("userDetails", JSON.stringify(user_details));


      console.log(access)
      console.log(refresh)
      setTimeout(() => {
        navigate('/main');
      }, 500);

    } catch (error) {
      if (error.response) {
        if (error.response.status === 403) {
          alert("Invalid credentials");
          console.log("Invalid credentials");
        } else if (error.response.data && error.response.data.error) {
          alert(error.response.data.error);
          console.log(error.response.data.error);
        } else {
          alert("An error occurred. Please try again.");
          console.log("An error occurred:", error.response);
        }
      } else {
        alert("An error occurred. Please try again.");
        console.log("An unexpected error occurred:", error);
      }
    }
  };


  const handleSubmit2 = async (e) => {
    e.preventDefault();
  
    const apiUrl = `${VITE_APP_SERVER}/auth/create-user/`;
  
    const formDataToSend = new FormData();
  
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== "") {
        formDataToSend.append(key, value);
      }
    });
  
    try {
      // ⬇️ Capture the response
      const response = await axios.post(apiUrl, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      // ⬇️ Now response.status is available
      if (response.status === 200 || response.status === 201) {
        alert('User Created Successfully');
        setTab("Log In");
      } else {
        alert(`Failed to create user: ${response.data.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert(err.response?.data?.error || "An error occurred");
    }
  };
  
    return (
        <div className='w-full h-screen bg-[#F2F2F2] flex justify-center items-center font-montserrat '>

            <div className='w-[70%] h-[80%] bg-white rounded-[10px] flex p-4 '>

                <div className='LOGO w-[50%] h-full rounded-[10px] bg-[#F9F9FB] hidden xl:flex justify-center items-center '>

                    <img src="/assets/CA logo.svg"/>

                </div>

                <div className='FORM xl:w-[50%] w-[100%] h-full rounded-[10px] flex justify-center items-center '>

                 {tab === "Log In" &&  <form onSubmit={handleSubmit} className='w-[80%] flex flex-col items-center justify-center '>

                        <p className='font-bold text-[30px] 2xl:text-[40px] text-[#1E1F24] '>Log In</p>

                        <div className='w-full flex flex-col gap-y-1.5 mt-12 '>
                            <label className='font-semibold text-[14px] 2xl:text-[18px] font-poppins text-[#1E1F24] '>Email</label>
                            <input type='email' name="email" value={credentials.email} onChange={handleChange} required placeholder='Enter email here...' className='w-full h-[40px] px-4 rounded-[6px] font-medium border border-[#E7E8EC] placeholder:text-[#62636C] '/>
                        </div>

                        <div className='w-full flex flex-col gap-y-1.5 mt-5 relative'>
                            <label className='font-semibold text-[14px] 2xl:text-[18px] font-poppins text-[#1E1F24] '>Password</label>
                            <input type='password' name="password" id="myInput" value={credentials.password} onChange={handleChange} required placeholder='Enter password here...' className='w-full h-[40px] font-medium px-4 rounded-[6px] border border-[#E7E8EC] placeholder:text-[#62636C] '/>
                            <Eye color="#1E1F24" onClick={myFunction} className="absolute bottom-2 right-3 cursor-pointer " />
                        </div>

                        <p className='font-medium text-[12px] 2xl:text-[14px] self-start mt-1 font-poppins text-[#62636C] '>*Use 6 or more characters and no spaces.</p>

                        <button type='submit' className='w-full h-[40px] rounded-[6px] bg-[#2C87F2] text-white text-[16px] font-semibold font-poppins mt-5 ' >Continue</button>
                        {/* <p className='font-medium text-[13px] font-poppins text-[#383A3E] mt-3 '>OR</p>
                        <button className='w-full h-[40px] rounded-[6px] bg-[#00AC17] text-white text-[16px] font-semibold font-poppins mt-3 ' >Log in with OTP</button> */}
                    
                        <div className='flex gap-x-2 items-center mt-4 '>
                        <p className='font-medium text-[14px] font-poppins text-[#1E1F24] '>Don't Have account?</p>
                        <p onClick={()=>setTab("Sign Up")}  className='font-semibold text-[15px] font-poppins text-[#2C87F2] cursor-pointer  '>Register Now</p>
                        </div>
                         
                    </form> }

                    {tab === "Sign Up" &&  <form onSubmit={handleSubmit2} className='w-[80%] flex flex-col items-center justify-center '>

<p className='font-bold text-[30px] 2xl:text-[40px] text-[#1E1F24] '>Sign Up</p>

<div className='w-full flex flex-col gap-y-1.5 mt-12 '>
    <label className='font-semibold text-[14px] 2xl:text-[18px] font-poppins text-[#1E1F24] '>Username</label>
    <input type='text' name="username" value={formData.username} onChange={handleChange2} required placeholder='Enter username here...' className='w-full h-[40px] px-4 rounded-[6px] font-medium border border-[#E7E8EC] placeholder:text-[#62636C] '/>
</div>

<div className='w-full flex flex-col gap-y-1.5 mt-5 '>
    <label className='font-semibold text-[14px] 2xl:text-[18px] font-poppins text-[#1E1F24] '>Email</label>
    <input type='email' name="email" value={formData.email} onChange={handleChange2} required placeholder='Enter email here...' className='w-full h-[40px] px-4 rounded-[6px] font-medium border border-[#E7E8EC] placeholder:text-[#62636C] '/>
</div>

<div className='w-full flex flex-col gap-y-1.5 mt-5 relative'>
    <label className='font-semibold text-[14px] 2xl:text-[18px] font-poppins text-[#1E1F24] '>Password</label>
    <input type='password' name="password" id="myInput" value={formData.password} onChange={handleChange2} required placeholder='Enter password here...' className='w-full h-[40px] font-medium px-4 rounded-[6px] border border-[#E7E8EC] placeholder:text-[#62636C] '/>
    <Eye color="#1E1F24" onClick={myFunction} className="absolute bottom-2 right-3 cursor-pointer " />
</div>

<p className='font-medium text-[12px] 2xl:text-[14px] self-start mt-1 font-poppins text-[#62636C] '>*Use 6 or more characters and no spaces.</p>

<button type='submit' className='w-full h-[40px] rounded-[6px] bg-[#2C87F2] text-white text-[16px] font-semibold font-poppins mt-5 ' >Sign Up</button>
{/* <p className='font-medium text-[13px] font-poppins text-[#383A3E] mt-3 '>OR</p>
<button className='w-full h-[40px] rounded-[6px] bg-[#00AC17] text-white text-[16px] font-semibold font-poppins mt-3 ' >Log in with OTP</button> */}

<div className='flex gap-x-2 items-center mt-4 '>
<p className='font-medium text-[14px] font-poppins text-[#1E1F24] '>Already Have an account?</p>
<p onClick={()=>setTab("Log In")}  className='font-semibold text-[15px] font-poppins text-[#2C87F2] cursor-pointer  '>Log In</p>
</div>
 
</form> }   

                </div>
               

            </div>

        </div>
    )
}

export default Login