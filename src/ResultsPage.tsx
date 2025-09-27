import { useEffect} from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {useNavigate, useLocation} from 'react-router-dom'
import NavBar from './assets/NavBar.tsx'
import './App.css'


function ResultsPage(){

    const navigate = useNavigate();
    const auth = getAuth();
    const location = useLocation();

    const payload = location.state;
    
    useEffect(()=>{
        onAuthStateChanged(auth, (user)=>{
            if (user){
                console.log('Logged In');
            }else{
                navigate("/login");
            }
        });
    })

    return(
        <div className="resultpage-body">
            <NavBar/>
            <div className="resultpage-maincontainer">
                <div className="resultpage-header">Congratulations {payload.name}, you have completed <b>{payload.title}</b></div>
                <div className="resultpage-subcontainer">
                    <img className="resultpage-image" src={payload.image}/>
                    <div className="resultpage-desc">You earned {payload.points_added} points from completing this episode.<br></br><br></br>You now have {payload.total_points} points in total!</div>
                    <button className="resultpage-button" onClick={()=>{navigate("/")}}>Return home</button>
                </div>
            </div>
        </div>
    )

}

export default ResultsPage;