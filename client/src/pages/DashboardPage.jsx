import React, { useState, useEffect } from 'react';
const ProjectCard = ({ project }) => {
    return (
        <div style={{border:'1px solid #ccc', padding:'10px',margin:'10px 0'}}>
            <h3>{project.name}</h3> 
            <p>{project.description || 'No Description'}</p>
            <small>
                Creator: {project.projectCreator ? project.projectCreator.name:'N/A'}(
                    {project.projectCreator ? project.projectCreator.email: 'N/A'})
            </small>
            <h4>Team Members:</h4>
            <ul>
                {project.teamMembers && project.teamMembers.length > 0 ? (
                    project.teamMembers.map((member)=>(
                        <li key = {member._id}>
                            {member.name} ({member.email})
                        </li>
                    ))
                ) : (
                    <li>No team members yet.</li>
                )}
            </ul>
            {/* To add project detail page*/}      
        </div>
    );
};
//Main dashboard component
const DashboardPage=()=>{
    const [projects,setProjects]=useState([]);
    const [isLoading, setIsLoading]=useState(true);
    const [error, setError]=useState(null);
    const [projectName,setProjectName]=useState('');
    const [projectDescription,setProjectDescription]=useState('');
    const fetchProjects=async()=>{
        try {
            setIsLoading(true);
            const res = await fetch('/api/projects');
            if (!res.ok){
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to fetch :${res.status}");
            }
            const data = await res.json();
            setProjects(data);
            setError(null);
        } catch (err){
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    //Data Loading
    useEffect(() =>{
        fetchProjects(); //Runs once when the component is mounted
    },[]);
    //Project Handling
    const handleCreateProject=async(e)=>{
        e.preventDefault();
        if (!projectName){
            alert('Project name is required');
            return;
        }
        try {
            const res = await fetch("/api/projects", {
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({
                    name:projectName,
                    description:projectDescription,
                }),
            });
            if (!res.ok){
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to create Project');

            }
            setProjectName('');
            setProjectDescription('');
            await fetchProjects();
        } catch (err){
            console.error(err);
            alert(`Error creating project:${err.message}`);
        }
    };

    return (
        <div style={{ padding :'20px'}}>
            <h2>My Dashboard</h2>
            {/*Creating a project*/}
            <div style={{border:'1px solid black',padding:'15px',marginBottom:'20px'}}>
                <h3>Create Project</h3>
                <form onSubmit={handleCreateProject}>
                    <div>
                        <label htmlFor="projectName">Project Name: </label>
                        <input
                            type="text"
                            id="projectName"
                            value={projectName}
                            onChange={(e)=>setProjectName(e.target.value)}
                            required
                        />
                    </div>
                    <div style ={{marginTop:'10px'}}>
                        <label htmlFor="projectDesc">Project Description:</label>
                        <input
                            type="text"
                            id='projectDesc'
                            value={projectDescription}
                            onChange={(e)=>setProjectDescription(e.target.value)}
                            rows="3"
                            style={{width:'300px'}}
                        />
                    </div>
                    <button type="submit" style = {{ marginTop:'10px'}}>
                        Create Project
                    </button>
                </form>
            </div>
            {/*Listing the projects*/}
            <div>
                <h3>My Project Space</h3>
                {isLoading && <p>Loading Projects....</p>}
                {error && <p style={{ color:'red'}}>Error:{error}</p>}
                {!isLoading && !error && projects.length ===0 && (
                    <p>You are not part of any projects yet.</p>
                )}
                <div>
                    {projects.map((project)=>(
                        <ProjectCard key={project._id} project={project} />
                    ))}
                </div> 
            </div>
        </div>
    );
};
export default DashboardPage;
