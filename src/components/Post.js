import React from 'react'
import {useState} from 'react'
import axios from "axios";
import { DateTime, Settings } from "luxon";
import { useNavigate, useLocation } from 'react-router-dom';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import ListItemIcon from '@mui/material/ListItemIcon';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

const Post = (props) => {
  Settings.defaultZone = "utc";
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [Text, setText] = useState(props.post.body);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };


  const editPost = (event)=>{
    event.preventDefault();
    axios({
        method: "POST",
        url:`/api/edit/${props.post.id}`,
        headers: {
            Authorization: 'Bearer ' + props.token
        },
        data:{
          text: Text,
       }
      })
      .then((response) => {
        console.log(response.data)
        response.access_token && props.setToken(response.access_token)
        props.post.body = Text
        setIsEditing(false)
        return
      }).catch((error) => {
        if(error.response) {
            console.log(error.response)
            console.log(error.response.status)
            console.log(error.response.headers)
        }
      })
  }


  const deletePost = (event)=>{
    event.preventDefault();
    axios({
        method: "POST",
        url:`/api/delete/${props.post.id}`,
        headers: {
            Authorization: 'Bearer ' + props.token
        }
      })
      .then((response) => {
        console.log(response.data)
        response.access_token && props.setToken(response.access_token)
        setIsVisible(false)
        return
      }).catch((error) => {
        if(error.response) {
            console.log(error.response)
            console.log(error.response.status)
            console.log(error.response.headers)
        }
      })
  }

  if(isVisible){
    return (

    <div className="post">

      <a className="username" onClick={()=>{navigate('/user/'+props.post.username)}}>
          {props.post.username}
      </a>
      <span style={{color: '#777', marginLeft: '5px', }} >{DateTime.fromSeconds(props.post.timestamp).toRelative()}</span>
      {isEditing?<></>:<>
      {localStorage.getItem('currentUser')===props.post.username?<>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        style={{float: 'right', padding:0}}
      ><MoreVertIcon /></IconButton>
      <Menu
        id="menu"
        aria-labelledby="long-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={()=>{setIsEditing(true); handleClose()}} color="success">
          <ListItemIcon>
            <EditIcon fontSize="small" color="success" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={deletePost} color="error">
          <ListItemIcon>
            <DeleteOutlinedIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu></>:<></>}</>}
      
      {isEditing?
      <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
        <TextField id="input" 
                       label="Editing..." 
                       variant="outlined"
                       fullWidth 
                       multiline 
                       maxRows={5} 
                       value={Text}
                       margin="normal"
                       autoFocus
                       onChange={(e) => {
                        setText(e.target.value)
                      }}
                       />
            <IconButton
                  aria-label="Post"
                  onClick={()=>{setIsEditing(false);setText(props.post.body)}}
                >
                  <CancelIcon color="error"/>
            </IconButton>
            <IconButton
                  aria-label="Post"
                  onClick={editPost}
                >
                  <CheckCircleIcon color="success"/>
            </IconButton>
        </Box>:<span className="post_body">{props.post.body}</span>}
    </div> 
  )}
else return(<></>)
}

export default Post