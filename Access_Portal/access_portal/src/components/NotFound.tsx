import { useNavigate, useParams } from 'react-router-dom';
import './NotFound.css';
import { Button } from '@mui/material';

const NotFound = () => {
  let errorImage = document.getElementById("notFoundImage");
  const {errorCode} = useParams();
  const navigate = useNavigate();

  const handleShadow = (e: { clientX: number; clientY: number; }) => {
    if (!errorImage) errorImage = document.getElementById("notFoundImage");
    const xOffset = (e.clientX / window.innerWidth - 0.5) * 40; // Adjust the multiplier as needed
    const yOffset = (e.clientY / window.innerHeight - 0.5) * 40; // Adjust the multiplier as needed
    
    // Update the drop shadow filter with new x and y values
    if (errorImage) {
      errorImage.style.filter = `drop-shadow(${xOffset}px ${yOffset}px 4px #5e5a5a79)`;
    }
  }

    return (
      <>
        <div className='notFoundContainer' >
          <img id={"notFoundImage"} src={`https://http.cat/${errorCode}`} alt={errorCode} />
          <Button variant="outlined" onClick={() => navigate("/access/login")} >Go Back</Button>
        </div>
        <div className="area" >
          <ul className="circles" onMouseMove={handleShadow}>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
        </div >
      </>
    )
  }
  
export default NotFound;