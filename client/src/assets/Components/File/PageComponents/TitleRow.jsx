//ICONS
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import DeleteIcon from '@mui/icons-material/Delete';

//BS
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const TitleRow = ({
    newTitle,
    isEditing,
    handleTitleChange,
    handleKeyUp,
    handleTitleClick,
    handleDelete,
    navigateBack
}) => {
    return(
        <Row style={{width:"70%",marginRight:"auto",marginLeft:"auto",paddingTop:70,alignItems:"center"}}>
            <Col >
            {isEditing ? (
                <input
                    className="folder-input-change"
                    type="text"
                    value={newTitle}
                    onChange={handleTitleChange}
                    onKeyPress={handleKeyUp}
                    autoFocus
                />
                ) : (
                <h2 className="first_bar-txt" onClick={handleTitleClick}>
                    {newTitle}
                </h2>
                )}
                {isEditing ? 
                <h5 style={{opacity:0.8,paddingTop:5}}>Press Enter to OK</h5>:null
                }
            </Col>
            <Col className='col-auto folder-edit-btn' style={{cursor:"pointer"}} >
            <DesignServicesIcon onClick={handleTitleClick}/>
        </Col>
        <Col className='col-auto folder-delete-btn' style={{cursor:"pointer"}} >
            <DeleteIcon onClick={handleDelete}/>
        </Col>
        <div className='zero_bar-row2'> 
            <div className='back-button'>
            <ArrowBackIosNewIcon onClick={navigateBack} sx={{p:1}}/> 
            </div>
        </div>
        </Row>
    )
}

export default TitleRow;