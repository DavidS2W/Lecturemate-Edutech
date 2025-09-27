import { useEffect, useState } from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {doc, getDoc} from 'firebase/firestore'
import {useNavigate, useParams} from 'react-router-dom'
import NavBar from './assets/NavBar.tsx'
import db from './configuration.tsx'
import './App.css'

function QuestionPageEdit(){

    const {courseID, storyID, episodeID} = useParams();
    const auth = getAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState("Loading..."); 
    const [questionsData, setQuestionsData] = useState<any[]>([]);

    useEffect(()=>{
        onAuthStateChanged(auth, (user)=>{
            if (user){
                console.log('Logged In')
            }else{
                navigate("/login")
            }
        });

        async function getQuestionList(){
            if (!courseID || !storyID) {
                console.error("courseID or storyID is undefined");
                return;
            }
            let getEpisodeQuery;

            getEpisodeQuery = await getDoc(doc(db, "course_db", courseID));
            let course = getEpisodeQuery.data();

            let storiesList = course && course.stories;

            let story = storiesList.find((e: any) => e.id === storyID);
            let episode = story.episodes.find((e:any)=> e.id === episodeID);
            let questionIDList = episode.questions;

            course && story && episode && setTitle(`${course.title} > ${story.title} > Ep${story.episodes.indexOf(episode)+1}: ${episode.title}`)

            async function getQuestion(id: string){
                let query = await getDoc(doc(db, "question_db", id));
                let info = query.data();

                return(info);
            }

            const questionPromises = questionIDList.map((e: string) => getQuestion(e));
            const questions = await Promise.all(questionPromises);
            setQuestionsData(questions);

            console.log(questions);
        };

        getQuestionList();
    }, [])

    return(
        <div className="coursepage-body">
            <NavBar/>
            <div className="coursepage-edit-container">
                <button className="coursepage-edit-button" onClick={()=>{navigate(`/admin/create/${courseID}/${storyID}/${episodeID}`);}}>+ New Question</button>
            </div>
            <div className="coursepage-header">{title}</div>
            <div className="coursepage-list">
                {questionsData.map((question)=>{
                    return(
                        <div className="coursepage-box" onClick={()=>{navigate(`/admin/${courseID}/${storyID}/${episodeID}/${question.id}`)}}>
                            <div className="coursepage-box-title">Q{questionsData.indexOf(question)+1}: {question.title}</div>
                            <hr className="coursepage-box-line"/>
                            <img className="coursepage-box-img" src={question.image}/>
                        </div>
                    )
                })}
            </div>
        </div>
    )

};

export default QuestionPageEdit