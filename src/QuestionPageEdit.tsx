import { useEffect, useState } from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {doc, getDoc, setDoc, deleteDoc} from 'firebase/firestore'
import {useNavigate, useParams} from 'react-router-dom'
import NavBar from './assets/NavBar.tsx'
import db from './configuration.tsx'
import './App.css'

function QuestionPageEdit(){

    const {courseID, storyID, episodeID} = useParams();
    const auth = getAuth();
    const navigate = useNavigate();
    const [questionsData, setQuestionsData] = useState<any[]>([]);
    const [directory, setDirectory] = useState(["Loading", "Loading", "Loading"]);

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

            let story = storiesList.find((e: any) =>{ return e.id === storyID});
            let episode = story.episodes.find((e:any)=>{return e.id === episodeID});
            let questionIDList = episode.questions;

            course && story && episode && setDirectory([course.title, story.title, episode.title])

            async function getQuestion(id: string){
                let query = await getDoc(doc(db, "question_db", id));
                let info = query.data();
                if(info){
                    info.id = id;
                };

                return(info);
            }

            const questionPromises = questionIDList.map((e: string) => getQuestion(e));
            const questions = await Promise.all(questionPromises);
            setQuestionsData(questions);

        };

        getQuestionList();
    }, []);

    async function deleteCourse(id: string){
        let getCourseData = courseID && await getDoc(doc(db, "course_db", courseID));
        let courseData = getCourseData && getCourseData.data();

        let story = courseData && courseData.stories.find((e:any)=>{return e.id === storyID});
        let episode = story.episodes.find((e:any)=>{return e.id === episodeID});
        let questionList = episode.questions;
        questionList.filter((e:string)=>{return e !== id});

        episode.questions = questionList;
        let newEpisodeList = story.episodes.filter((e:any)=>{return e.id !== episodeID});
        newEpisodeList.push(episode);

        let newStoryList = courseData && courseData.stories.filter((e:any)=>{return e.id !== storyID});

        story.episodes = newEpisodeList;
        newStoryList.push(story);
        courseID && await setDoc(doc(db, "course_db", courseID), {stories: newStoryList}, {merge: true});
        id && await deleteDoc(doc(db, "question_db", id));
        let newQuestionList = questionsData.filter((e:any)=>{return e.id !== id});
        setQuestionsData(newQuestionList);
    };

    return(
        <div className="coursepage-body">
            <NavBar/>
            <div className="coursepage-header"><a href={`/admin`}><b>{directory[0]}</b></a> {'>'} <a href={`/admin/${courseID}`}><b>{directory[1]}</b></a> {'>'} <a href={`/admin/${courseID}/${storyID}`}><b>{directory[2]}</b></a> {'>'} all questions</div>
            <div className="coursepage-edit-container">
                <button className="coursepage-edit-button" onClick={()=>{navigate(`/admin/create/${courseID}/${storyID}/${episodeID}`);}}>+ New Question</button>
            </div>
            <div className="coursepage-list">
                {questionsData.map((question)=>{
                    return(
                        <div className="coursepage-box" key={question.id}>
                            <div className="coursepage-box-title">Q{questionsData.indexOf(question)+1}. {question.title}</div>
                            <hr className="coursepage-box-line"/>
                            <img className="coursepage-box-img" src={question.image}/>
                            <div className="coursepage-button-container">
                                <button className="coursepage-smalledit-button" onClick={()=>{navigate(`/admin/edit/${courseID}/${storyID}/${episodeID}/${question.id}`)}}>Edit</button>
                                <button className="coursepage-smalledit-button" onClick={async()=>{await deleteCourse(question.id)}}>Delete</button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )

};

export default QuestionPageEdit