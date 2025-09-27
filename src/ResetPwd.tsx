import {auth} from './configuration'
import {signInWithEmailAndPassword, onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential} from 'firebase/auth'
import {useState, useEffect} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'



function ResetPwdPage(){

    const [password, setPassword] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [buttonState, setButton] = useState('Log In');
    const navigate = useNavigate();
    const location = useLocation();

    const userData = location.state;

    useEffect(()=>{
        onAuthStateChanged(auth, (user)=>{
            if (user){
                console.log(userData);
                setNewPwd(userData.newPwd);
            }else{
                navigate("/login");
            }
        });
    }, []);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const submit = async(e:any) => {

        const email = userData.email;
        console.log(email);
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password).then(async ()=>{

            if(auth.currentUser && auth.currentUser.email){
            
                const credential = auth.currentUser && EmailAuthProvider.credential(auth.currentUser.email, password);
                console.log(credential);
                await reauthenticateWithCredential(auth.currentUser, credential);
                await updatePassword(auth.currentUser, newPwd);
                setButton("✅ Password changed!");
                await sleep(1000);
                navigate("/user");
                
            }
            

        }).catch((error)=>{setButton('❌ Try again!'); console.log(error)});

    }

    return(
        <div className="signup-body">
            <div className="signup-box">
                <div className="signup-text">Re-enter your old password to confirm this action</div>
                <div className="signup-box-container">
                    <div className="signup-text small">Old Password: </div>
                    <input className="signup-box-input" type="password" value={password} onChange={(e) => {setPassword(e.target.value)}}/>
                </div>
                <div className="signup-box-container">
                    <div className="signup-text small">New Password: </div>
                    <input className="signup-box-input" type="password" value={newPwd} onChange={(e) => {setNewPwd(e.target.value)}}/>
                </div>
                <div className="signup-button-container">
                    <button className="signup-button" onClick={submit}>{buttonState}</button>
                </div>
            </div>
        </div>
    )
}

export default ResetPwdPage;