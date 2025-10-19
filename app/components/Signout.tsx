"use client"

import Cookies from 'js-cookie'


export default function Signout() {
    const handleSignout = () => {
        const cookieNames = Object.keys(Cookies.get());

  // 2. Loop through and remove each one (assuming default path '/')
  cookieNames.forEach(name => {
    // Attempt to remove with default path '/'
    Cookies.remove(name, { path: '/' });
    
    // NOTE: If some cookies were set with other paths (e.g., '/admin'),
    // you would need to know those paths and call Cookies.remove(name, { path: '/admin' })
  });
    }
    return (
        <button onClick={handleSignout} >Sign out</button>
    )
}