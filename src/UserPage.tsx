import { useEffect, useState } from 'react'
import {getAuth, onAuthStateChanged, updateProfile} from 'firebase/auth'
import {doc, getDoc, setDoc} from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {useNavigate} from 'react-router-dom'
import NavBar from './assets/NavBar.tsx'
import db from './configuration.tsx'
import './App.css'

function UserPage(){
    const navigate = useNavigate();
    const auth = getAuth();

    const [name, setName] = useState("Loading...");
    const [email, setEmail] = useState("Loading...");
    const [pfp, setPfp] = useState("/pfp.jpg");
    const [pfpFile, setPfpFile] = useState<File | null>(null);
    const [nameState, setNameState] = useState(true);
    const [pfpState, setPfpState] = useState(true);
    const [pwdState, setPwdState] = useState(true);
    const [points, setPoints] = useState(0);
    const [pwd, setPwd] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const [buttonText, setButtonText] = useState('Expand');

    const [stuffDone, setStuffDone] = useState<any[]>([]);

    

    function changeState(value:string | File, func: (content: boolean)=> void){
        if(value === "" || value === null){
            func(true);
        }else{
            func(false);
        }
    }

    // replaced body to use the selected file state (pfpFile)
    const uploadProfilePic = async (userId: string) => {
        if (!pfpFile) return null; // If no file is selected, return null
        const storage = getStorage();
        const storageRef = ref(storage, `profile_pictures/${userId}`); // store under profile_pictures/<uid>
        await uploadBytes(storageRef, pfpFile); // Upload the file
        const url = await getDownloadURL(storageRef); // Get the download URL
        setPfp(url); 
        auth.currentUser && updateProfile(auth.currentUser, {photoURL: url});
        return url;
    };

    useEffect(()=>{
        onAuthStateChanged(auth, async (user)=>{
            if (user){
                console.log("Logged In");
                setUserId(user.uid);
                if (user.uid) {
                    const docRef = doc(db, 'account_db', user.uid);
                    const docSnap = await getDoc(docRef);
                    const userData = docSnap.data();

                    if (userData && userData.name && user.photoURL) {
                        setName(userData.name);
                        setEmail(userData.email);
                        setPfp(user.photoURL);
                        setPoints(userData.points)
                        setStuffDone(userData.episodes_done || []);
                    }    
                }
            }else{
                navigate("/login");
            }
        })
    }, []);

    function updatePwd(userInfo: any){
        navigate("/resetpwd", {state: {newPwd: userInfo.newPwd, email: userInfo.email}});
    };

    return(
        <div className="userpage-body">
            <NavBar/>
            <div className="userpage-topsection">
                <img src={pfp} className="userpage-pfp"/>
                <div className="userpage-topsection-container">
                    <div className="userpage-topsection-data big">{name}</div>
                    <div className="userpage-topsection-data">{email}</div>
                    <div className="userpage-topsection-data">{points} points</div>
                </div>
            </div>
            <div className="userpage-midsection">
                <div className="userpage-midsection-title">Edit your data</div>
                <div className="userpage-midsection-fieldcontainer">
                    <div className="userpage-midsection-text">Username</div>
                    <input
                        className="userpage-midsection-input"
                        value={name}
                        onChange={(e)=>{ setName(e.target.value); changeState(e.target.value, setNameState); }}
                    />
                    <button className="userpage-midsection-button" disabled={nameState} onClick={async ()=>{
                        auth.currentUser && updateProfile(auth.currentUser, {displayName: name});
                        userId && await setDoc(doc(db, "account_db", userId), {name: name}, {merge: true});
                        setNameState(true);
                    }}>Update</button>
                </div>
                <div className="userpage-midsection-fieldcontainer">
                    <div className="userpage-midsection-text">Password</div>
                    <input
                        className="userpage-midsection-input"
                        type="password"
                        value={pwd}
                        onChange={(e)=>{ setPwd(e.target.value); changeState(e.target.value, setPwdState); }}
                    />
                    <button className="userpage-midsection-button" disabled={pwdState} onClick={()=>{
                        auth.currentUser && updatePwd({email: auth.currentUser.email, newPwd: pwd})
                    }}>Update</button>
                </div>
                <div className="userpage-midsection-fieldcontainer">
                    <div className="userpage-midsection-text">Profile Pic</div>
                    <input
                        className="userpage-midsection-input-file"
                        type="file"
                        // do not bind `value` for file inputs; use files from event
                        onChange={(e)=> {
                            const file = e.target.files ? e.target.files[0] : null;
                            setPfpFile(file);
                            setPfpState(!file); // enable button if file exists
                        }}
                    />
                    <button
                        className="userpage-midsection-button"
                        disabled={pfpState}
                        onClick={async ()=>{
                            if (!userId) return;
                            await uploadProfilePic(userId);
                            setPfpFile(null);
                            setPfpState(true);
                        }}
                    >
                        Update
                    </button>
                </div>
            </div>
            <div className="userpage-bottomsection">
                <div className="userpage-bottomsection-text">Tasks completed</div>
                {Array.isArray(stuffDone) && stuffDone.map((stuff, idx) => {
                    

                    let episodeData = 'Episodes completed:';

                    stuff.episodes.map((ep:any)=>{
                        let text = `\n${stuff.episodes.indexOf(ep)+1}. ${ep.title}  |  ${ep.points} points`;
                        episodeData = episodeData+text;
                    })

                    function toggleShow(id: string){
                        let targetDiv = document.getElementById(id);
                        if (targetDiv && targetDiv.style.display === "none") {
                            targetDiv.style.display = "flex"; // Show the div
                            setButtonText('Collapse');
                        }else if(targetDiv && targetDiv.style.display !== "none"){
                            targetDiv.style.display = "none"; // Hide the div
                            setButtonText('Expand');
                        };
                    };

                    return(
                    <div key={idx} className="userpage-bottomsection-coursecontainer">
                        <div className="userpage-bottomsection-coursetab">
                            <div className="userpage-bottomsection-coursetab-text">{stuff.course_title}</div>
                            <button className="userpage-bottomsection-coursetab-button" onClick={()=>{toggleShow(`eps-${idx}`)}}>{buttonText}</button>
                        </div>
                        <div className="userpage-bottomsection-episodetab" style={{'display': 'none'}} id={`eps-${idx}`}>{episodeData}</div>
                    </div>
                )})}
            </div>
        </div>
    )

}

export default UserPage
