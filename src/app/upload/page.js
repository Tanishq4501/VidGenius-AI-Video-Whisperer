import React from 'react'
import UploadDashboard from "../../components/upload-dashboard";
import {auth} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";

const Page = async () => {
    const {userId} = await auth();

    if(!userId){
        redirect('/sign-in');
    }
    return (
        <UploadDashboard/>
    )
}
export default Page
