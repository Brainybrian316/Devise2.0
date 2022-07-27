import { Image } from 'react-bootstrap';
import './Home.css';


export default function Home() {

  return (
    <>
    <Image src={require('../../assets/images/Hero2.png')} fluid id='hero' />
   
    </>
  );
}