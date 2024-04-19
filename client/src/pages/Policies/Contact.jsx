
import { useState } from "react"
import "../../Css/policies.css"
import VpnLockIcon from '@mui/icons-material/VpnLock';
import BugReportIcon from '@mui/icons-material/BugReport';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import StorageIcon from '@mui/icons-material/Storage';
import MultipleSelectChip from "../../assets/Components/Policy/FeedbackSelector"
import { db, storage } from "../../firebase"
import {doc,setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {v4} from "uuid";
import {useAuth} from "../../context/UserAuthContext";


const Contact = () =>{


//<******************************VARIABLESS*******************************>
const { currentuser } = useAuth();

//REPORT useStates
const [reportTitle,setReportTitle] = useState("")
const [reportDescription,setReportDescription] = useState("")
const [reportFile,setReportFile] = useState(null)
const [reportCategory,setReportCategory] = useState("")


//<******************************FUNCTIONS*******************************>

//HANDLE REPORT FILE TO STATE
const handleReportFile = (e) =>{
    e.preventDefault();
    setReportFile(e.target.files[0]);
}

//HANDLE REPORT TITLE TO STATE
const handleReportTitle = (e) =>{
    e.preventDefault();
    setReportTitle(e.target.value);
}

//HANDLE REPORT DESCRIPTION TO STATE
const handleReportDescription = (e) =>{
    e.preventDefault();
    setReportDescription(e.target.value);
}

//HANDLE REPORT SUBMIT
const handleReportSubmit = async () =>{
    if(currentuser){
        const reportId = v4();
        const reportDate = new Date().toLocaleDateString();
        if(reportDescription.length > 10){
            if(reportTitle.length > 1){
                if(reportCategory.length != ""){
                    try{
                        if(reportFile != null && currentuser){
                            const feedbackRef = doc(db, "feedback", reportId,reportCategory,currentuser.uid);
                            const storageRef = ref(storage, `users/${currentuser.uid}/feedback/${reportId}`);
                            await uploadBytes(storageRef, reportFile);
                            const fileUrl = await getDownloadURL(storageRef);
                            const newFeedback = {
                                title: reportTitle,
                                description: reportDescription,
                                file: fileUrl,
                                report_id: reportId,
                                user_id: currentuser.uid,
                                user_email: currentuser.email,
                            }
                            await setDoc(feedbackRef,newFeedback)
                            setDoc(doc(db, "feedback",reportId), {
                                created: reportDate,
                                report_id: reportId,
                                user_id: currentuser.uid
                            });
                            alert("Your Feedback has been sent to our Team. Thank you for your Support")
                        }else{
                            const feedbackRef = doc(db, "feedback", reportId,reportCategory,currentuser.uid);
                            const newFeedback = {
                                title: reportTitle,
                                description: reportDescription,
                                report_id: reportId,
                                user_id: currentuser.uid,
                                user_email: currentuser.email,
                            }
                            await setDoc(feedbackRef,newFeedback)
                            setDoc(doc(db, "feedback",reportId), {
                                created: reportDate,
                                report_id: reportId,
                                user_id: currentuser.uid
                            });
                            alert("Your Feedback has been sent to our Team. Thank you for your Support")
                        }
                    }catch(err){
                        console.log(err)
                    }
                }else{
                    alert("Please select a category for your problem")
                }
            }else{
                alert("Please give a title for your problem")
            }  
        }else{
            alert("Please give a detailed description about your problem")
        }
    }else{
        alert("You need to be logged for us to know !")
    }
}


return(
<div className="legal">
    <div className="legal-nav-bar">
        <a href="/"><h2>Home</h2></a>
        <a href="/policies"><h4>Overview</h4></a>
        <a href="/policies/security"><h4>Security</h4></a>
        <a href="/support/feedback"> <h4>Feedback</h4> </a>
        <a href="/policies/legal"> <h4>Legal</h4> </a>
        <h4 className="selected-legal">Contact Us</h4> 
    </div>

    <div className="legal-page-title" style={{textAlign:"center"}}>
        <h2>Get In Touch</h2>
        <h6 style={{width:500,fontSize:10}}>Your trust is at the center of what we do and why security is a top priority for us. Our products, processes and systems are designed to protect our users and data.</h6>
    </div>

    <div className="security-features-cont">
        <div className="security-row"> 
            <div className="security-box">
                <VpnLockIcon className="highlight-icon" />
                <h3>Customer Service</h3>
                <h6>
                    Contact us on this if you have any questions or problems with our software, payment, subscription.
                </h6>
                <h6 style={{paddingTop:10}}>clippify.help@gmail.com</h6>
            </div>

            <div className="security-box">
                <BugReportIcon className="highlight-icon"/>
                <h3>Bug Support</h3>
                <h6>
                    Help us Improve! Contact us on this if you found any bugs or problems with our software.
                </h6>
                <h6 style={{paddingTop:10}}>clippify.feedback@gmail.com</h6>
            </div>

            <div className="security-box">
                <SupervisedUserCircleIcon className="highlight-icon" />
                <h3>Offical Email</h3>
                <h6>
                    Contact us on this if you want to make a bussiness deal with us or join our Team.
                </h6>
                <h6 style={{paddingTop:10}}>clippify.app@gmail.com</h6>
            </div>

            <div className="security-box">
                <StorageIcon className="highlight-icon" />
                <h3>Social Platforms</h3>
                <h6>
                    You can get in touch with us on our Social Platforms and get the latest news about our Software.
                </h6>
                <h6 style={{paddingTop:10}}>clippify.app</h6>
            </div>
        </div>
    </div>

    <div className="bug">
        <div className="bug-cont">
            <div className="bug-column">
                <h2>Report Bugs !</h2>
                <h5 style={{width:400}}>
                    Our main focus is your smooth experience using our Software. Help us in our goal and if you found something unordenary please contact us !
                </h5>
                <a href="/support/report"><h5>More</h5></a>
            </div>
            <div className="bug-pic" />
        </div>
    </div>

    <div className="report-container">
        <div className="firebase-sec-title">
            <h2>Report a vulnerability</h2>
            <hr style={{width:440,borderColor:"black"}} />
        </div>

        <div className="report-title">
            <div>
                <h2>Report Title</h2>
                <h6>Give a Title for your problem</h6>
            </div>
            <input type="text" className="input-txt" onChange={handleReportTitle} value={reportTitle}/>
        </div>

        <hr style={{width:"100%",borderColor:"black"}} />

        <div className="report-select">
            <div>
                <h2>Issue Category</h2>
                <h6>Give an Area where you found your Problem</h6>
            </div>
            <MultipleSelectChip reportCategory={setReportCategory}/>
        </div>

        <hr style={{width:"100%",borderColor:"black"}} />

        <div className="report-upload">
            <div>
                <div>
                    <h6 style={{opacity:0.8}} className="highlighter">Optional</h6>
                    <h2>Upload Evidence</h2>
                    <h6>Please provide evidence for Faster / Smoother Improvment</h6>
                </div>
                <input type="file" className="inpit-file" style={{paddingTop:25}} onChange={handleReportFile} />
            </div>
        </div>

        <hr style={{width:"100%",borderColor:"black"}} />

        <div className="report-desc">
            <div>
                <h6 style={{opacity:0.8}} className="highlighter">Minimum 10 words</h6>
                <h2>Description</h2>
                <h6>Please give a detailed description about your problem</h6>
            </div>
            <textarea style={{width:"100%",height:300,padding:10}} onChange={handleReportDescription} value={reportDescription}  />
        </div>

        <div className="report-send">
            <button style={{width:200,height:50}} onClick={handleReportSubmit}>Send</button>
        </div>
    </div>

    <footer style={{width:1920,alignSelf:"center"}} className="footer">
        <div className="container-footer">
            <div className="row">
                <div className="footer-col">
                    <h4>company</h4>
                    <ul>
                        <li><a href="/support/contact-us">about us</a></li>
                        <li><a href="/policies/legal/terms">Terms of Use</a></li>
                        <li><a href="/policies/legal/privacy-policy">privacy policy</a></li>
                        
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>get help</h4>
                    <ul>
                        <li><a href="/policies">FAQ</a></li>
                        <li><a href="/subscription">subscription</a></li>
                        <li><a href="/settings">cancel & returns</a></li>
                        <li><a href="/settings">payment options</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>Contact Us</h4>
                    <ul>
                        <li><a href="/support/contact-us">Customer Support</a></li>
                        <li><a href="/support/feedback">Any Questions ?</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>follow us</h4>
                    <div className="social-links">
                        <a href="#"><i className="fab fa-facebook-f"></i></a>
                        <a href="#"><i className="fab fa-twitter"></i></a>
                        <a href="https://www.instagram.com/echotheorca.app/"><i className="fab fa-instagram"></i></a>
                        <a href="https://www.youtube.com/channel/UCA5s3Bjs3MiXWnsg_Wn10hQ"><i className="fab fa-youtube"></i></a>
                    </div>
                </div>
            </div>
        </div>
    </footer>
</div>
)};

export default Contact