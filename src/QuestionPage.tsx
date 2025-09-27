import { useEffect, useState } from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {doc, getDoc, updateDoc} from 'firebase/firestore'
import {useNavigate, useParams} from 'react-router-dom'
import NavBar from './assets/NavBar.tsx'
import db from './configuration.tsx'
import './App.css'


function QuestionPage(){

    const {courseID, storyID, episodeID} = useParams();
    const navigate = useNavigate();
    const auth = getAuth();

    let timenow = new Date();
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [booster, setBooster] = useState("ON");
    const [episodeData, setEpisodeData] = useState({title: "Loading...", description: "Loading...", image: "/placeholder_img.jpg", questions: []});
    const [questionData, setQuestionData] = useState<any[]>([{content: "Loading...", image: "/placeholder_img.jpg", type: "mcq", question_list: ["loading_question"]}]);
    const [subquestionData, setSubquestionData] = useState<any[]>([{content: "Loading...", choices: ["Loading1...", "Loading2...", "Loading3...", "Loading4..."], answer: "no!!"}]);
    const [recentPoints, setRecentPoints] = useState(0);
    const [points, setPoints] = useState(0);
    const [lives, setLives] = useState({count: 4, list: ["/red_heart.png", "/red_heart.png", "/red_heart.png", "/red_heart.png"]});
    const [timestamp, setTimestamp] = useState(timenow);
    const [questionsLeft, setQuestionsLeft] = useState(0);
    const[userpageTitle, setUserpageTitle] = useState('');


    useEffect(()=>{
        onAuthStateChanged(auth, (user)=>{
            if (user){
                console.log('Logged In');
            }else{
                navigate("/login");
            }
        });

        async function getData(){
            if (!courseID) {
                console.error("courseID is undefined");
                return;
            }
            let getQuery;

            getQuery = await getDoc(doc(db, "course_db", courseID));
            let course = getQuery.data();
            let storiesList = course && course.stories;
            let story = storiesList.find((e: any) => e.id === storyID);
            let episode = story.episodes.find((e: any) => e.id === episodeID);

            course && story && setUserpageTitle(`${course.title} > ${story.title}`);

            async function getQuestion(id: string){
                let query = await getDoc(doc(db, "question_db", id));
                let info = query.data();

                return(info);
            }

            setEpisodeData(episode);
            let fullQuestionData;

            { 
                fullQuestionData = await Promise.all(episode.questions.map((e: string) => getQuestion(e)));
            }
            setQuestionData(fullQuestionData);

            let initialQuestion = fullQuestionData[0];
            let questionChoices = initialQuestion.question_list;
            setSubquestionData([...questionChoices]);
            
            let total = 0;
            fullQuestionData.forEach((e: any) => {
                let questionCount = e.question_list.length;
                total += questionCount;
            });
            setQuestionsLeft(total);
            setTotalQuestions(total);

        };

        getData();
    }, [])

    async function submitAnswer(choice:string, answer:string){
        if(choice === answer){
            let currentTime = new Date();
            let elapsedTime = currentTime.getTime() - timestamp.getTime();
            setTimestamp(currentTime);

            if(elapsedTime < 15000 && lives.count > 0){
                let calcPoints = 200 + +(((15000-elapsedTime)/15000)*200).toFixed(0);
                setRecentPoints(calcPoints);
                setPoints(points+calcPoints);
            }else{
                setRecentPoints(200);
                setPoints(points+200);
            }

        }else{
            setRecentPoints(0);
            if (lives.count > 0){
                let originalList = lives.list;
                originalList.reverse();
                let updatedList = originalList.slice(1, 4);
                updatedList.push("/black_heart.png");
                updatedList.reverse();
                setLives({count: lives.count-1, list: updatedList});
                if (updatedList.includes("/red_heart.png") ===  false){
                    setBooster("OFF");
                }
            }
        }

        setQuestionsLeft(questionsLeft-1);

        if(subquestionData.length === 1 && questionData.length !== 1){
            let newList = questionData.slice(1);
            setQuestionData(newList);
            let initialQuestion = newList[0];
            setSubquestionData(initialQuestion.question_list);
        }else if(subquestionData.length !== 1){
            let newList = subquestionData.slice(1);
            setSubquestionData(newList);
        }else if(subquestionData.length === 1 && questionData.length === 1){

            const getUserInfo = auth.currentUser && await getDoc(doc(db, "account_db", auth.currentUser.uid));
            let userInfo = getUserInfo?.data();
            let checkCourse = userInfo && userInfo.episodes_done.find((e:any)=> (e.course_id === courseID));

            let initialList = userInfo && userInfo.episodes_done;

            const dataAdded = {episode_id:episodeID, points: points, date_done: new Date(), title: episodeData.title, course_title:userpageTitle,};
            let initialPoints = userInfo && userInfo.points;

            if (checkCourse === undefined){
                initialList.push({course_id: courseID, course_title:userpageTitle, episodes: [dataAdded]});
                auth.currentUser && await updateDoc(doc(db, "account_db", auth.currentUser.uid), {episodes_done: initialList, points: initialPoints+points});
            }else{
                let epsList = checkCourse.episodes;
                epsList.push(dataAdded);
                checkCourse.episodes = epsList;

                let newUserInfo = userInfo && userInfo.episodes_done.filter((e: any) => (e.course_id !== courseID));
                newUserInfo.push(checkCourse);

                auth.currentUser && await updateDoc(doc(db, "account_db", auth.currentUser.uid), {episodes_done: newUserInfo, points: initialPoints+points});
            };

            const payload = userInfo && {name: userInfo.name, points_added: points, total_points: userInfo.points+points, image: episodeData.image, title: episodeData.title};

            navigate("/results", {state:payload});
            
        }

        setTimestamp(new Date());
    };


    return(
        <div className="questionpage-body">
            <NavBar/>
            <div className="questionpage-body-container">
                <div className="questionpage-body-left">
                    <div className="questionpage-maintext">PASSAGE: <p></p>{questionData[0].content}</div>
                    <div className="questionpage-question-container">
                        <div className="questionpage-question-text">{subquestionData[0].content}</div>
                        {subquestionData[0].choices.map((choice: string)=>{
                            return(
                            <div className="questionpage-question-answer" key={choice} onClick={()=>{submitAnswer(choice, subquestionData[0].answer)}}>
                                {choice}
                            </div>)
                        }
                        )}
                    </div>
                </div>
                <div className="questionpage-body-right">
                    <div className="questionpage-heading-container">
                        <div className="questionpage-title">{episodeData.title}</div>
                        <div className="questionpage-desc">{episodeData.description}</div>
                        <img src={episodeData.image} className="questionpage-img"/>
                    </div>
                    <div className="questionpage-status">
                        <div className="questionpage-status-lifecontainer">{lives.list.map((e:string)=>{
                            return(
                                <img src={e} className="questionpage-status-life-icon"></img>
                            )
                        })}</div>
                        <div className="questionpage-status-field">Score booster ⚡: {booster}</div>
                        <div className="questionpage-status-field">Recent question: +{recentPoints}pts</div>
                        <div className="questionpage-status-field">Points earned: {points}</div>
                        <div className="questionpage-status-field">Progress: {totalQuestions > 0 ? ((1-(questionsLeft/totalQuestions))*100).toFixed(2) : 0}%</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QuestionPage