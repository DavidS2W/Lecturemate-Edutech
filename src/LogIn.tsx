import {auth} from './configuration'
import {signInWithEmailAndPassword} from 'firebase/auth'
import {useState} from 'react'
import {useNavigate} from 'react-router-dom'



function LogInPage(){

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [buttonState, setButton] = useState('Log In');
    const navigate = useNavigate();


    const submit = async(e:any) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password).then(()=>{
            
            setButton('✅ Success!');
            

        }).catch((error)=>{setButton('❌ Try again!'); console.log(error)});

    }

    return(
        <div className="signup-body">
            <div className="signup-box">
                <div className="signup-text">Welcome back to Lecturemate</div>
                <div className="signup-box-container">
                    <div className="signup-text small">Email: </div>
                    <input className="signup-box-input" value = {email} onChange={(e)=>{setEmail(e.target.value)}}/>
                </div>
                <div className="signup-box-container">
                    <div className="signup-text small">Password: </div>
                    <input className="signup-box-input" type="password" value={password} onChange={(e) => {setPassword(e.target.value)}}/>
                </div>
                <div className="signup-button-container">
                    <button className="signup-button" onClick={submit}>{buttonState}</button>
                </div>
                <div className="signup-text tiny" onClick={()=>{navigate("/signup")}}>Sign Up</div>
            </div>
        </div>
    )
}

export default LogInPage;