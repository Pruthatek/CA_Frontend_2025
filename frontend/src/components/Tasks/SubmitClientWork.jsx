import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useColor } from "../ColorContext/ColorContext";

const SubmitClientWork = ({ setOpenSubmit, selectedAssignment }) => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
const { selectedColor } = useColor();

  useEffect(() => {
    fetchById();
   
  }, [selectedAssignment.id]);

  useEffect(() => {
    console.log("Selected Assignment:", selectedAssignment);
  }, [selectedAssignment]);
  
  const [activities,setActivities] = useState([])
  const [activityStages, setActivityStages] = useState([])
  const [requiredFiles, setRequiredFiles] = useState([]);
  const [outputFiles, setOutputFiles] = useState([]);
  const [additionalFiles, setAdditionalFiles] = useState([]);

  const [newActivity, setNewActivity] = useState({
    activity: "",
    status: "pending",
    note: "",
  });
  const [newAdditionalFile, setNewAdditionalFile] = useState({
    file_name: "",
    file: null,
  });


  const fetchById= async () => {
    try {
      const response = await axiosPrivate.get(`/workflow/client-work-category-assignment/get/${selectedAssignment.id}/`);
      console.log(response.data);
      setActivities(response.data.activities)
      setActivityStages(response.data.activity_stage)
      setOutputFiles(response.data.output_files)
      setRequiredFiles(response.data.required_files)
    } catch (err) {
      
      alert('Error fetching assignment', err);
    }
  };

  const submitNewActivity = async () => {
    const payload = {
      required_files: [
        {
          activity: newActivity.activity,
          status: newActivity.status,
          note: newActivity.note,
        },
      ],
    };

    try {
      const response = await axiosPrivate.put(
        `/workflow/submit-client-work/additional-activity/${selectedAssignment.id}/`,
        payload
      );
      alert(
        "Additional activity added successfully with id: " +
          response.data.id
      );
      // Clear form fields and refresh data if needed
      setNewActivity({ activity: "", status: "pending", note: "" });
      fetchById();
    } catch (err) {
      alert("Error adding additional activity", err);
    }
  };

  // Submit new additional file
  const submitNewAdditionalFile = async () => {
    const formData = new FormData();
    // Backend expects an array under key "required_files" (here one object)
    formData.append(
      "required_files",
      JSON.stringify({
        file_name: newAdditionalFile.file_name,
      })
    );
    if (newAdditionalFile.file) {
      formData.append("file", newAdditionalFile.file);
    }
    try {
      const response = await axiosPrivate.put(
        `/workflow/submit-client-work/additional-files/${selectedAssignment.id}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert(
        "Additional file added successfully with id: " +
          response.data.id
      );
      // Clear form fields and refresh data if needed
      setNewAdditionalFile({ file_name: "", file: null });
      fetchById();
    } catch (err) {
      alert("Error adding additional file", err);
    }
  };

  return (
    <div className="p-6 w-[60%] h-[500px] overflow-y-scroll mx-auto bg-white shadow-2xl border rounded-lg space-y-6">
      <div className="flex w-full justify-between items-center ">
      <h2 className="text-lg font-semibold text-gray-700">Submit Client Work</h2>

      <X onClick={()=>setOpenSubmit(false)} className="cursor-pointer " />
      </div>
      

<div className="grid grid-cols-2 gap-3 ">

<div className=" flex flex-col gap-y-3">

<p className="font-semibold text-[#383a3e] ">Activities</p>
{activities.length > 0 ? (
            activities.map((activity, index) => {
              // Check if previous activity is completed
              const canCheckThis =
                index === 0 || activities[index - 1].status === "completed";

              return (
    <div key={activity.id} className="flex flex-col gap-y-2 p-2 border rounded">
      <div className="flex gap-x-4 items-center text-[12px]">
        <p><b className="font-semibold ">ID:</b> {activity.id}</p>
        <p><b className="font-semibold ">Activity:</b> {activity.activity}</p>
        <p><b className="font-semibold ">Assigned %:</b> {activity.assigned_percentage}%</p>
      </div>
      {/* <div className="flex gap-x-4 items-center text-[12px] ">
        <label htmlFor={`status-${activity.id}`} className="font-semibold " >Status:</label>
        <select
          id={`status-${activity.id}`}
          value={activity.status}
          onChange={(e) => {
            const newActivities = [...activities];
            newActivities[index].status = e.target.value;
            setActivities(newActivities);
          }}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div> */}

      <div className="flex gap-x-4 items-center text-[12px]">
                    <label className="font-semibold">Completed?</label>
                    <input
                      type="checkbox"
                      checked={activity.status === "completed"}
                      disabled={!canCheckThis} // disable if previous is not completed
                      onChange={(e) => {
                        const newActivities = [...activities];
                        newActivities[index].status = e.target.checked
                          ? "completed"
                          : "pending";
                        setActivities(newActivities);
                      }}
                    />
                  </div>
      <div className="flex gap-x-4 items-center text-[12px]">
        <label htmlFor={`note-${activity.id}`} className="font-semibold " >Note:</label>
        <input
          id={`note-${activity.id}`}
          type="text"
          value={activity.note || ""}
          onChange={(e) => {
            const newActivities = [...activities];
            newActivities[index].note = e.target.value;
            setActivities(newActivities);
          }}
          className="border border-[#383a3e] rounded-[4px] "
        />
      </div>
      <button style={{backgroundColor: selectedColor?.bg}}
        className=" text-white px-2 py-1 rounded-md font-semibold text-[12px]"
        onClick={async () => {
          // Prepare payload for activity update
          const payload = {
            required_files: [
              {
                id: activity.id,
                status: activity.status,
                note: activity.note || "",
              },
            ],
          };
          try {
            await axiosPrivate.put(
              `/workflow/submit-client-work/activity-list/${selectedAssignment.id}/`,
              payload
            );
            alert("Activity updated successfully!");
          } catch (error) {
            alert("Error updating activity", error);
          }
        }}
      >
        Update Status
      </button>
    </div>
  );
})
) : (
<p>No activities found</p>
)}

</div>


<div className=" flex flex-col gap-y-3">
<p className="font-semibold text-[#383a3e] ">Activity Stages</p>
{activityStages.length > 0 ? (
            activityStages.map((activity, index) => {
              // Check if previous stage is completed
              const canCheckThis =
                index === 0 || activityStages[index - 1].status === "completed";

              return (
    <div key={activity.id} className="flex flex-col gap-y-2 p-2 border rounded text-[12px]">
      <div className="flex gap-x-4 items-center">
        <p><b className="font-semibold ">ID:</b> {activity.id}</p>
        <p><b className="font-semibold ">Activity Stage:</b> {activity.activity_stage}</p>
      
      </div>
      {/* <div className="flex gap-x-4 items-center">
        <label htmlFor={`status-${activity.id}`} className="font-semibold text-[12px] ">Status:</label>
        <select
          id={`status-${activity.id}`}
          value={activity.status}
          onChange={(e) => {
            const newActivityStages = [...activityStages];
            newActivityStages[index].status = e.target.value;
            setActivityStages(newActivityStages);
          }}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div> */}

<div className="flex gap-x-4 items-center">
                    <label className="font-semibold text-[12px]">Completed?</label>
                    <input
                      type="checkbox"
                      checked={activity.status === "completed"}
                      disabled={!canCheckThis} // disable if previous stage is not completed
                      onChange={(e) => {
                        const newStages = [...activityStages];
                        newStages[index].status = e.target.checked
                          ? "completed"
                          : "pending";
                        setActivityStages(newStages);
                      }}
                    />
                  </div>
      <div className="flex gap-x-4 items-center">
        <label htmlFor={`note-${activity.id}`} className="font-semibold text-[12px] ">Note:</label>
        <input
          id={`note-${activity.id}`}
          type="text"
          value={activity.note || ""}
          onChange={(e) => {
            const newActivityStages = [...activityStages];
            newActivityStages[index].note = e.target.value;
            setActivityStages(newActivityStages);
          }}
          className="border border-[#383a3e] rounded-[4px] "
        />
      </div>
      <button style={{backgroundColor: selectedColor?.bg}}
        className=" text-white px-2 py-1 rounded-md font-semibold text-[12px]"
        onClick={async () => {
          // Prepare payload for activity update
          const payload = {
            required_files: [
              {
                id: activity.id,
                status: activity.status,
                note: activity.note || "",
              },
            ],
          };
          try {
            await axiosPrivate.put(
              `/workflow/submit-client-work/activity-stage/${selectedAssignment.id}/`,
              payload
            );
            alert("Activity stage updated successfully!");
          } catch (error) {
            alert("Error updating activity stage", error);
          }
        }}
      >
        Update Status
      </button>
    </div>
  );
})
) : (
<p>No activity stages found</p>
)}
</div>

<div className=" flex flex-col gap-y-3">

<p className="font-semibold text-[#383a3e] ">Output Files</p>


{outputFiles.length > 0 ? (
  outputFiles.map((file, index) => (
    <div key={file.id} className="flex flex-col gap-y-2 p-2 border rounded">
      <div className="flex gap-x-4 items-center text-[12px]">
        <p><b className="font-semibold ">ID:</b> {file.id}</p>
        <p><b className="font-semibold ">File Name:</b> {file.file_name}</p>
        <p><b className="font-semibold ">Current Path:</b> {file.file_path}</p>
      </div>
      <input
        type="file"
        onChange={(e) => {
          const newFiles = [...outputFiles];
          newFiles[index].file = e.target.files[0];
          setOutputFiles(newFiles);
        }}
      />
      <button style={{backgroundColor: selectedColor?.bg}}
        className=" text-white px-2 py-1 mt-20 rounded-md font-semibold text-[12px]"
        onClick={async () => {
          // Prepare form data if uploading a file
          const formData = new FormData();
          // backend expects a key "required_files" as an array
          formData.append(
            "required_files",
            JSON.stringify({
              id: file.id,
              // file field must be appended separately so remove it from JSON
            })
          );
          if (file.file) {
            formData.append("file", file.file);
          }
          try {
            await axiosPrivate.put(
              `/workflow/submit-client-work/output-files/${selectedAssignment.id}/`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            alert("Output file updated successfully!");
          } catch (error) {
            alert("Error updating output file", error);
          }
        }}
      >
        Update File
      </button>
    </div>
  ))
) : (
  <p>No output files found</p>
)}
</div>

<div className=" flex flex-col gap-y-3">
<p className="font-semibold text-[#383a3e] ">Required Files</p>
{requiredFiles.length > 0 ? (
  requiredFiles.map((file, index) => (
    <div key={file.id} className="flex flex-col gap-y-2 p-2 border rounded  ">
      <div className="flex gap-x-4 items-center text-[12px]">
        <p><b className="font-semibold ">ID:</b> {file.id}</p>
        <p><b className="font-semibold ">File Name:</b> {file.file_name}</p>
        <p><b className="font-semibold ">Current Path:</b>{file.file_path}</p>
      </div>
      {/* <input
        type="file"
        onChange={(e) => {
          const newFiles = [...requiredFiles];
          newFiles[index].file = e.target.files[0];
          setRequiredFiles(newFiles);
        }}
      /> */}
      {/* <button style={{backgroundColor: selectedColor?.bg}}
        className=" text-white px-2 py-1 mt-20 rounded-md font-semibold text-[12px]"
        onClick={async () => {
          // Prepare form data if uploading a file
          const formData = new FormData();
          // backend expects a key "required_files" as an array
          formData.append(
            "required_files",
            JSON.stringify({
              id: file.id,
              // file field must be appended separately so remove it from JSON
            })
          );
          if (file.file) {
            formData.append("file", file.file);
          }
          try {
            await axiosPrivate.put(
              `/workflow/submit-client-work/required-files/${selectedAssignment.id}/`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            alert("Required file updated successfully!");
          } catch (error) {
            alert("Error updating required file", error);
          }
        }}
      >
        Update File
      </button> */}
    </div>
  ))
) : (
  <p>No required files found</p>
)}
</div>

<div className="border p-4 rounded-lg">
        <p className="font-semibold">Add Additional Activity</p>
        <input
          type="text"
          placeholder="Activity"
          value={newActivity.activity}
          onChange={(e) =>
            setNewActivity({ ...newActivity, activity: e.target.value })
          }
          className="border p-1 my-1 w-full"
        />
        <select
          value={newActivity.status}
          onChange={(e) =>
            setNewActivity({ ...newActivity, status: e.target.value })
          }
          className="border p-1 my-1 w-full"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <input
          type="text"
          placeholder="Note"
          value={newActivity.note}
          onChange={(e) =>
            setNewActivity({ ...newActivity, note: e.target.value })
          }
          className="border p-1 my-1 w-full"
        />
        <button style={{backgroundColor: selectedColor?.bg}}
          onClick={submitNewActivity}
          className=" text-white px-2 py-1 font-semibold rounded-md text-[10px]"
        >
          Add Activity
        </button>
      </div>

      {/* Additional File Section */}
      <div className="border p-4 rounded-lg">
        <p className="font-semibold">Add Additional File</p>
        <input
          type="text"
          placeholder="File Name"
          value={newAdditionalFile.file_name}
          onChange={(e) =>
            setNewAdditionalFile({
              ...newAdditionalFile,
              file_name: e.target.value,
            })
          }
          className="border p-1 my-1 w-full"
        />
        <input
          type="file"
          onChange={(e) =>
            setNewAdditionalFile({
              ...newAdditionalFile,
              file: e.target.files[0],
            })
          }
          className="border p-1 my-1 w-full"
        />
        <button style={{backgroundColor: selectedColor?.bg}}
          onClick={submitNewAdditionalFile}
          className=" text-white px-2 py-1 font-semibold rounded-md text-[10px]"
        >
          Add File
        </button>
      </div>
    

</div>
    </div>
  );
};

export default SubmitClientWork;
