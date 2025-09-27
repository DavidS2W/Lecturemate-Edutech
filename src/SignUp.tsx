import db from './configuration'
import { createUserWithEmailAndPassword, updateProfile, getAuth} from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from './assets/NavBar.tsx'

function SignUpPage() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [buttonState, setButton] = useState('Sign Up');
    const [profilePic, setProfilePic] = useState<File | null>(null); // State for profile picture
    const [profilePicName, setProfilePicName] = useState<string>('No file chosen'); // State for filename
    const navigate = useNavigate();
    const auth = getAuth();

    const uploadProfilePic = async (userId: string) => {
        if (!profilePic) return null; // If no file is selected, return null
        const storage = getStorage();
        const storageRef = ref(storage, userId); // Store file in 'profile_pictures/<user_id>'
        await uploadBytes(storageRef, profilePic); // Upload the file
        return await getDownloadURL(storageRef); // Get the download URL
    };

    const add_to_user = async (e: any) => {
        await setDoc(doc(db, "account_db", e.uid), {
            email: e.email,
            name: name,
            points: 0,
            signup_date: new Date(),
            episodes_done: []
        });
    }

    const submit = async (e: any) => {
        e.preventDefault();
        await createUserWithEmailAndPassword(auth, email, password).then(async () => {
            setButton('✅ Signed up!');
            if (auth.currentUser) {
                const userId = auth.currentUser.uid;
                const photoURL = await uploadProfilePic(userId); // Upload profile picture and get URL
                add_to_user(auth.currentUser);
                updateProfile(auth.currentUser, {
                    displayName: name,
                    photoURL: photoURL || 'https://static.vecteezy.com/system/resources/previews/021/548/095/non_2x/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg'
                });
            }
            navigate("/");

        }).catch(() => {
            setButton('❌ Try again!');
        });
    }

    return (
        <div className="signup-body">
            <div style={{ position: 'absolute', top: 0, width: '100%' }}>
                <NavBar />
            </div>
            <div className="signup-box">
                <div className="signup-text">Sign Up Here</div>
                <div className="signup-box-container">
                    <div className="signup-text small">Username: </div>
                    <input className="signup-box-input" value={name} onChange={(e) => { setName(e.target.value) }} />
                </div>
                <div className="signup-box-container">
                    <div className="signup-text small">Email: </div>
                    <input className="signup-box-input" value={email} onChange={(e) => { setEmail(e.target.value) }} />
                </div>
                <div className="signup-box-container">
                    <div className="signup-text small">Password: </div>
                    <input className="signup-box-input" value={password} onChange={(e) => { setPassword(e.target.value) }} />
                </div>
                <div className="signup-box-container">
                    <div className="signup-text small">Profile Pic: </div>
                    <div className="signup-text small">{profilePicName}</div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files ? e.target.files[0] : null;
                            setProfilePic(file);
                            setProfilePicName(file ? file.name : 'No file chosen'); // Update filename
                        }}
                    />
                    
                </div>
                <div className="signup-button-container">
                    <button className="signup-button" onClick={submit}>{buttonState}</button>
                </div>
                <div className="signup-text tiny" onClick={() => { navigate("/login", { state: "" }) }}>Login</div>
            </div>
        </div>
    );
}

export default SignUpPage;