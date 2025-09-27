import { useEffect } from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import { BrowserRouter as Router, Routes, Route, useNavigate} from 'react-router-dom'
import NavBar from './assets/NavBar.tsx'
import LogInPage from './LogIn.tsx'
import SignUpPage from './SignUp.tsx'
import CoursePage from './CoursePage.tsx'
import StoryPage from './StoryPage.tsx'
import EpisodePage from './EpisodePage.tsx'
import CoursePageEdit from './CoursePageEdit.tsx'
import StoryPageEdit from './StoryPageEdit.tsx'
import EpisodePageEdit from './EpisodePageEdit.tsx'
import QuestionPageEdit from './QuestionPageEdit.tsx'
import CreateCoursePage from './CreateCourse.tsx'
import CreateStoryPage from './CreateStory.tsx'
import CreateEpisodePage from './CreateEpisode.tsx'
import QuestionPage from './QuestionPage.tsx'
import CreateQuestionPage from './CreateQuestion.tsx'
import ResultsPage from './ResultsPage.tsx'
import UserPage from './UserPage.tsx'
import ResetPwdPage from './ResetPwd.tsx'
import './App.css'


function HomePage(){
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(()=>{
    onAuthStateChanged(auth, (user)=>{
      if(user){
        console.log('Logged In')
      }else{
        navigate("/login")
      }
    });

  }, []);

  
  return(
    <div className="homepage-body">
      <NavBar/>
      <div className="homepage-midsection">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMBCqU3-KGQ6EV89wO706dZg-OM3u1od0NtA&s" className="homepage-midsection-image"/>
        <div className="homepage-midsection-desc">Welcome to Lecturemate's Ed-Tech Portal</div>
      </div>
      <div className="homepage-lowsection">
        <button className="homepage-button" onClick={()=>{navigate("/courses")}}>Find my courses</button>
      </div>
    </div>
  )
};


function App() {
  return(
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />}/>
        <Route path="/login" element={<LogInPage />}/>
        <Route path="/signup" element={<SignUpPage />}/>
        <Route path="/courses" element={<CoursePage />}/>
        <Route path="/courses/:courseID" element={<StoryPage />}/>
        <Route path="/courses/:courseID/:storyID" element={<EpisodePage />}/>
        <Route path="/courses/:courseID/:storyID/:episodeID" element={<QuestionPage />}/>
        <Route path="/admin" element={<CoursePageEdit />}/>
        <Route path="/admin/:courseID" element={<StoryPageEdit />}/>
        <Route path="/admin/:courseID/:storyID" element={<EpisodePageEdit />}/>
        <Route path="/admin/:courseID/:storyID/:episodeID" element={<QuestionPageEdit />}/>
        <Route path="/admin/create/" element={<CreateCoursePage />}/>
        <Route path="/admin/create/:courseID" element={<CreateStoryPage />}/>
        <Route path="/admin/create/:courseID/:storyID" element={<CreateEpisodePage />}/>
        <Route path="/admin/create/:courseID/:storyID/:episodeID" element={<CreateQuestionPage />}/>
        <Route path="/results" element={<ResultsPage />}/>
        <Route path="/user" element={<UserPage/>}/>
        <Route path="/resetpwd" element={<ResetPwdPage />}/>
      </Routes>
    </Router>
  )
};

export default App
