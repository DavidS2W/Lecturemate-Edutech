import { useState, useEffect } from 'react'
import { useNavigate} from 'react-router-dom'
import {getAuth, onAuthStateChanged} from 'firebase/auth'

function NavBar(){
    const navigate = useNavigate();

    const [pfp, setPfp] = useState<any>("/pfp.jpg");
    const auth = getAuth();

    useEffect(()=>{
        onAuthStateChanged(auth, (user)=>{
            if(user){
                setPfp(user.photoURL);
            }
        })
    }, [])

    return(
        <div className="navbar-body">
            <div className="navbar-leftcontainer">
                <img src="/lm_logo.png" className="navbar-logo"/>
                <div className="navbar-text" onClick={()=>{navigate("/")}}>Home</div>
                <div className="navbar-text" onClick={()=>{navigate("/courses")}}>Courses</div>
            </div>
            <img src={pfp} className="navbar-pfp" onClick={()=>{navigate("/user")}}/>
        </div>
    )
}

export default NavBar;