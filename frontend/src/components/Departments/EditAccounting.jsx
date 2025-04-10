import React, { useEffect, useState } from 'react';
import { useColor } from '../ColorContext/ColorContext';
import { Copy, FilePenLine, Plus, SquarePen, Trash2, X } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import WorkCategoryManagement from './WorkCategoryManagement';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

const EditAccounting = ({
  editPage,
  setEditPage,
  workCategories,
  fetchWorkCategories,
  buttons
}) => {
  const { selectedColor } = useColor();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
 

  // Department creation states
  const [name, setName] = useState('');
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);
  const [manager, setManager] = useState('');

  // Work category states
  const [addNew, setAddNew] = useState(false);
  const [selectedWorkCategory, setSelectedWorkCategory] = useState(null);

  // File popup states
  const [openFiles, setOpenFiles] = useState(false);      // toggles the entire file popup
  const [files, setFiles] = useState([]);                 // the list of files_required for the selected work category
  const [selectedWork, setSelectedWork] = useState(null); // store the entire work object for reference

  // Form inside the file popup
  const [showFileForm, setShowFileForm] = useState(false);  // toggles the create/edit form
  const [editMode, setEditMode] = useState(false);          // false => create, true => edit
  const [selectedFile, setSelectedFile] = useState(null);   // which file is being edited
  const [fileName, setFileName] = useState('');             // for both create/edit

    // This holds data for direct create usage if you like
    const [fileData, setFileData] = useState({
      work_category: 0,
      file_name: ''
    });

  // OUTPUT popup states
  const [openOutput, setOpenOutput] = useState(false);      
  const [outputs, setOutputs] = useState([]);                 
  const [selectedWork2, setSelectedWork2] = useState(null); 

  // Form inside the OUTPUT popup
  const [showOutputForm, setShowOutputForm] = useState(false);  
  const [editMode2, setEditMode2] = useState(false);          
  const [selectedOutput, setSelectedOutput] = useState(null);  
  const [outputName, setOutputName] = useState('');             


  // This holds data for direct create usage if you like
  const [outputData, setOutputData] = useState({
    work_category: 0,
    file_name: ''
  });

    // ActivityList popup states
    const [openActivityList, setOpenActivityList] = useState(false);      
    const [activityLists, setActivityLists] = useState([]);                 
    const [selectedWork3, setSelectedWork3] = useState(null); 
  
    // Form inside the ActivityList popup
    const [showActivityListForm, setShowActivityListForm] = useState(false);  
    const [editMode3, setEditMode3] = useState(false);          
    const [selectedActivityList, setSelectedActivityList] = useState(null);  
    const [activityName, setActivityName] = useState('');     
    const [assignedPercentage, setAssignedPercentage] = useState('');             
  
  
    // This holds data for direct create usage if you like
    const [activityListData, setActivityListData] = useState({
      work_category: 0,
      activity_name: '',
      assigned_percentage: ''
    });


    
  // ActivityList popup states
  const [openActivityStage, setOpenActivityStage] = useState(false);      
  const [activityStages, setActivityStages] = useState([]);                 
  const [selectedWork4, setSelectedWork4] = useState(null); 

  // Form inside the ActivityList popup
  const [showActivityStageForm, setShowActivityStageForm] = useState(false);  
  const [editMode4, setEditMode4] = useState(false);          
  const [selectedActivityStage, setSelectedActivityStage] = useState(null);  
  const [activityStageName, setActivityStageName] = useState('');     
  const [desc, setDesc] = useState('');             


  // This holds data for direct create usage if you like
  const [activityStageData, setActivityStageData] = useState({
    work_category: 0,
    activity_stage: '',
    description: ''
  });

  useEffect(() => {
    fetchDepartments();
    fetchManagers();
    // fetchWorkCategories() // you call it outside if needed
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axiosPrivate.get('/workflow/department/get/');
      setDepartments(response.data);
    } catch (err) {
      
      alert('Error fetching departments', err);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await axiosPrivate.get('/auth/get-user/');
      setManagers(response.data.employees);
    } catch (err) {
      alert('Error fetching managers', err);
    }
  };

  const handleCreateDepartment = async () => {
    try {
      const response = await axiosPrivate.post('/workflow/department/create/', {
        name,
        manager
      });
      alert('Department Created: ' + response.data.id);
      fetchDepartments();
      setName('');
      setManager('');
    } catch (err) {
      
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  // -----------------------------
  // Work Category CRUD
  // -----------------------------
  const handleDeleteWorkCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this work category?')) return;
    try {
      await axiosPrivate.delete(`/workflow/work-category/deactivate/${id}/`);
      fetchWorkCategories(buttons.id);
    } catch (error) {
      
        alert('Error deleting work category');
      
    }
  };

  const handleEditWorkCategory = (workCategory) => {
    setSelectedWorkCategory(workCategory);
    setAddNew(true); // reuse the same popup for editing
  };

//////////////////////////////////////////////// REQ FILES START ////////////////////////////////////////////////////////////
  // -----------------------------
  // Files popup
  // -----------------------------
  const filesClicked = (files, work) => {
    // On click of the 'DOC Required' cell, open the popup
    setFiles(files);
    setOpenFiles(true);
    setSelectedWork(work);
    // Pre-set the fileData state to have the correct work_category
    setFileData({ work_category: work.id, file_name: '' });
  };

  const closeFilesPopup = () => {
    setOpenFiles(false);
    // reset states if needed
    setFiles([]);
    setSelectedWork(null);
    setShowFileForm(false);
    setEditMode(false);
    setSelectedFile(null);
    setFileName('');
  };

  // -----------------------------
  // File required CREATE, UPDATE, DELETE
  // -----------------------------
  const createWorkCategoryFile = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosPrivate.post('/workflow/work-category-files-required/create/', {
        work_category: selectedWork?.id,
        file_name: fileName
      });
      // On successful creation, you can either refetch or push to local state
      // e.g. push to local state:
      const newFile = response.data;
      setFiles((prev) => [...prev, newFile]);
      setShowFileForm(false);
      setFileName('');
      fetchWorkCategories(buttons.id)
    } catch (error) {
      alert('Error creating work category file requirement:', error.response?.data || error.message);
      throw error;
    }
  };

  const updateWorkCategoryFile = async (e) => {
    e.preventDefault();
    console.log("Selected File: ", selectedFile.id);
    if (!selectedFile) {
      alert('No file selected for update.');
      return;
    }
    try {
      const response = await axiosPrivate.put(
        `/workflow/work-category-files-required/update/${selectedFile.id}/`,
        {
          file_name: fileName
        }
      );
      // On success, update local state
      const updated = response.data;
      fetchWorkCategories(buttons.id)
      setFiles((prev) => {
        return prev.map((f) => (f.id === updated.id ? updated : f));
      });
      setShowFileForm(false);
      setFileName('');
      setSelectedFile(null);
      setEditMode(false);
      
    } catch (error) {
      alert('Error updating work category file:', error.response?.data || error.message);
    }
  };

  const deactivateWorkCategoryFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await axiosPrivate.delete(`/workflow/work-category-files-required/deactivate/${fileId}/`);
      // remove from local state:
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      fetchWorkCategories(buttons.id)
    } catch (error) {
      alert('Error deactivating work category file:', error.response?.data || error.message);
    }
  };

  // Handlers to show the "Add New" / "Edit" form
  const handleAddNewFile = () => {
    setShowFileForm(true);
    setEditMode(false);
    setSelectedFile(null);
    setFileName('');
  };

  const handleEditFile = (file) => {
    setShowFileForm(true);
    setEditMode(true);
    console.log(file)
    setSelectedFile(file);
    setFileName(file.file_name);
  };
////////////////////////////////////////////////REQ FILES END ////////////////////////////////////////////////////////////


//////////////////////////////////////////////// OUTPUT DOC START ////////////////////////////////////////////////////////////
  // -----------------------------
  // Files popup
  // -----------------------------
  const outputClicked = (outputs, work) => {
    // On click of the 'DOC Required' cell, open the popup
    setOutputs(outputs);
    setOpenOutput(true);
    setSelectedWork2(work);
    // Pre-set the fileData state to have the correct work_category
    setOutputData({ work_category: work.id, file_name: '' });
  };

  const closeOutputPopup = () => {
    setOpenOutput(false);
    // reset states if needed
    setOutputs([]);
    setSelectedWork2(null);
    setShowOutputForm(false);
    setEditMode2(false);
    setSelectedOutput(null);
    setOutputName('');
  };

  // -----------------------------
  // File required CREATE, UPDATE, DELETE
  // -----------------------------
  const createWorkCategoryOutputDoc = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosPrivate.post('/workflow/work-category-output-document/create/', {
        work_category: selectedWork2?.id,
        file_name: outputName
      });
      // On successful creation, you can either refetch or push to local state
      // e.g. push to local state:
      const newOutput = response.data;
      setOutputs((prev) => [...prev, newOutput]);
      setShowOutputForm(false);
      setOutputName('');
      fetchWorkCategories(buttons.id)
    } catch (error) {
      alert('Error creating work category outcome document:', error.response?.data || error.message);
      throw error;
    }
  };

  const updateWorkCategoryOutputDoc = async (e) => {
    e.preventDefault();
    if (!selectedOutput) {
      alert('No Doc selected for update.');
      return;
    }
    try {
      const response = await axiosPrivate.put(
        `/workflow/work-category-output-document/update/${selectedOutput.id}/`,
        {
          file_name: outputName
        }
      );
      // On success, update local state
      const updated = response.data;
      fetchWorkCategories(buttons.id)
      setOutputs((prev) => {
        return prev.map((f) => (f.id === updated.id ? updated : f));
      });
      setShowOutputForm(false);
      setOutputName('');
      setSelectedOutput(null);
      setEditMode2(false);
      
    } catch (error) {
      alert('Error updating work category outcome doc:', error.response?.data || error.message);
    }
  };

  const deactivateWorkCategoryOutputDoc = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this doc?')) return;
    try {
      await axiosPrivate.delete(`/workflow/work-category-output-document/deactivate/${fileId}/`);
      // remove from local state:
      setOutputs((prev) => prev.filter((f) => f.id !== fileId));
      fetchWorkCategories(buttons.id)
    } catch (error) {
      alert('Error deactivating work category outcome doc:', error.response?.data || error.message);
    }
  };

  // Handlers to show the "Add New" / "Edit" form
  const handleAddNewOutput = () => {
    setShowOutputForm(true);
    setEditMode2(false);
    setSelectedOutput(null);
    setOutputName('');
  };

  const handleEditOutputDOc = (file) => {
    setShowOutputForm(true);
    setEditMode2(true);
    setSelectedOutput(file);
    setOutputName(file.file_name);
  };
////////////////////////////////////////////////OUTPUT DOC END ////////////////////////////////////////////////////////////


//////////////////////////////////////////////// ACTIVITY LIST START ////////////////////////////////////////////////////////////
const activityListClicked = (activityLists, work) => {
  // On click of the 'DOC Required' cell, open the popup
  setActivityLists(activityLists);
  setOpenActivityList(true);
  setSelectedWork3(work);
  // Pre-set the fileData state to have the correct work_category
  setActivityListData({ work_category: work.id, activity_name: '', assigned_percentage: ''  });
};

const closeActivityListPopup = () => {
  setOpenActivityList(false);
  // reset states if needed
  setActivityLists([]);
  setSelectedWork3(null);
  setShowActivityListForm(false);
  setEditMode3(false);
  setSelectedActivityList(null);
  setActivityName('');
};

// -----------------------------
// File required CREATE, UPDATE, DELETE
// -----------------------------
const createWorkCategoryActivityList = async (e) => {
  e.preventDefault();
  try {
    const response = await axiosPrivate.post('/workflow/work-category-activity-list/create/', {
      work_category: selectedWork3?.id,
      activity_name: activityName,
      assigned_percentage: assignedPercentage
    });
    // On successful creation, you can either refetch or push to local state
    // e.g. push to local state:
    const newActivityList = response.data;
    setActivityLists((prev) => [...prev, newActivityList]);
    setShowActivityListForm(false);
    setActivityName('');
    fetchWorkCategories(buttons.id)
  } catch (error) {
    alert('Error creating work category Activity List:', error.response?.data || error.message);
    throw error;
  }
};

const updateWorkCategoryActivityList = async (e) => {
  e.preventDefault();
  if (!selectedActivityList) {
    alert('No Activity List selected for update.');
    return;
  }
  try {
    const response = await axiosPrivate.put(
      `/workflow/work-category-activity-list/update/${selectedActivityList.id}/`,
      {
        activity_name: activityName,
        assigned_percentage: assignedPercentage
      }
    );
    // On success, update local state
    const updated = response.data;
    fetchWorkCategories(buttons.id)
    setActivityLists((prev) => {
      return prev.map((f) => (f.id === updated.id ? updated : f));
    });
    setShowActivityListForm(false);
    setActivityName('');
    setSelectedActivityList(null);
    setEditMode3(false);
    
  } catch (error) {
    alert('Error updating work category Activity List:', error.response?.data || error.message);
  }
};

const deactivateWorkCategoryActivityList = async (fileId) => {
  if (!window.confirm('Are you sure you want to delete this Activity List?')) return;
  try {
    await axiosPrivate.delete(`/workflow/work-category-activity-list/deactivate/${fileId}/`);
    // remove from local state:
    setActivityLists((prev) => prev.filter((f) => f.id !== fileId));
    fetchWorkCategories(buttons.id)
  } catch (error) {
    alert('Error deactivating work category Activity List:', error.response?.data || error.message);
  }
};

// Handlers to show the "Add New" / "Edit" form
const handleAddNewActivityList = () => {
  setShowActivityListForm(true);
  setEditMode3(false);
  setSelectedActivityList(null);
  setActivityName('');
  setAssignedPercentage('')
};

const handleEditActivityList = (activityList) => {
  setShowActivityListForm(true);
  setEditMode3(true);
  setSelectedActivityList(activityList);
  setActivityName(activityList.activity_name);
  setAssignedPercentage(activityList.assigned_percentage)
};



//////////////////////////////////////////////// ACTIVITY LIST END ////////////////////////////////////////////////////////////

//////////////////////////////////////////////// ACTIVITY STAGE END ////////////////////////////////////////////////////////////
const activityStageClicked = (activityStages, work) => {
  // On click of the 'DOC Required' cell, open the popup
  setActivityStages(activityStages);
  setOpenActivityStage(true);
  setSelectedWork4(work);
  // Pre-set the fileData state to have the correct work_category
  setActivityStageData({ work_category: work.id, activity_stage: '', description: ''  });
};

const closeActivityStagePopup = () => {
  setOpenActivityStage(false);
  // reset states if needed
  setActivityStages([]);
  setSelectedWork4(null);
  setShowActivityStageForm(false);
  setEditMode4(false);
  setSelectedActivityStage(null);
  setActivityStageName('');
};

// -----------------------------
// File required CREATE, UPDATE, DELETE
// -----------------------------
const createWorkCategoryActivityStage = async (e) => {
  e.preventDefault();
  try {
    const response = await axiosPrivate.post('/workflow/work-category-activity-stage/create/', {
      work_category: selectedWork4?.id,
      activity_stage: activityStageName,
      description: desc
    });
    // On successful creation, you can either refetch or push to local state
    // e.g. push to local state:
    const newActivityStage = response.data;
    setActivityStages((prev) => [...prev, newActivityStage]);
    setShowActivityStageForm(false);
    setActivityStageName('');
    fetchWorkCategories(buttons.id)
  } catch (error) {
    alert('Error creating work category Activity Stage:', error.response?.data || error.message);
    throw error;
  }
};

const updateWorkCategoryActivityStage = async (e) => {
  e.preventDefault();
  if (!selectedActivityStage) {
    alert('No Activity Stage selected for update.');
    return;
  }
  try {
    const response = await axiosPrivate.put(
      `/workflow/work-category-activity-stage/update/${selectedActivityStage.id}/`,
      {
        activity_stage: activityStageName,
        description: desc
      }
    );
    // On success, update local state
    const updated = response.data;
    fetchWorkCategories(buttons.id)
    setActivityStages((prev) => {
      return prev.map((f) => (f.id === updated.id ? updated : f));
    });
    setShowActivityStageForm(false);
    setActivityStageName('');
    setSelectedActivityStage(null);
    setEditMode4(false);
    
  } catch (error) {
    alert('Error updating work category Activity Stage:', error.response?.data || error.message);
  }
};

const deactivateWorkCategoryActivityStage = async (fileId) => {
  if (!window.confirm('Are you sure you want to delete this Activity Stage?')) return;
  try {
    await axiosPrivate.delete(`/workflow/work-category-activity-stage/deactivate/${fileId}/`);
    // remove from local state:
    setActivityStages((prev) => prev.filter((f) => f.id !== fileId));
    fetchWorkCategories(buttons.id)
  } catch (error) {
    alert('Error deactivating work category Activity Stage:', error.response?.data || error.message);
  }
};

// Handlers to show the "Add New" / "Edit" form
const handleAddNewActivityStage = () => {
  setShowActivityStageForm(true);
  setEditMode4(false);
  setSelectedActivityStage(null);
  setActivityStageName('');
  setDesc('')
};

const handleEditActivityStage = (activityStage) => {
  setShowActivityStageForm(true);
  setEditMode4(true);
  setSelectedActivityStage(activityStage);
  setActivityStageName(activityStage.activity_stage);
  setDesc(activityStage.description)
};
//////////////////////////////////////////////// ACTIVITY STAGE END ////////////////////////////////////////////////////////////


const formatToIndianCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
  }).format(amount);
};
  return (
    <div className="w-full px-3 py-1 font-poppins relative">
      {/* Work Category Management Popup */}
      {addNew && (
        <div className="absolute w-full top-0 bottom-0 left-0 right-0">
          <WorkCategoryManagement
            addNew={addNew}
            setAddNew={setAddNew}
            fetchWorkCategories={fetchWorkCategories}
            buttons={buttons}
            selectedCategory={selectedWorkCategory}
            clearSelectedCategory={() => setSelectedWorkCategory(null)}
          />
        </div>
      )}

      {/* Files Popup */}
      {openFiles && (
        <div className="absolute top-0 bottom-0 left-0 right-0 w-full flex justify-center shadow-2xl">
          <div className="bg-white shadow-2xl border w-[400px] h-fit overflow-y-auto p-4 mt-20 rounded-[10px]">
            {/* Close Popup Button */}
            <div className="w-full flex justify-end mb-2">
              <X
                onClick={closeFilesPopup}
                size={16}
                className="cursor-pointer"
              />
            </div>

            {/* Title */}
            <div className="text-center mb-4">
              <p className="text-[16px] font-semibold">Files Required For: 
                <span className="ml-2 font-normal">{selectedWork?.name}</span>
              </p>
            </div>

            {/* Add New File Icon */}
            <div className="flex justify-end items-center mb-3">
              <Plus
                size={20}
                className="cursor-pointer hover:opacity-80"
                onClick={handleAddNewFile}
              />
            </div>

            {/* File List */}
            {files.length === 0 && (
              <p className="text-center text-sm text-gray-500">
                No files required listed.
              </p>
            )}
            {files.map((file, index) => (
              <div
                key={file.id}
                className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 mb-2"
              >
                <p className="text-sm">{file.file_name}</p>
                <div className="flex gap-x-2">
                  <SquarePen
                    onClick={() => handleEditFile(file)}
                    size={16}
                    className="cursor-pointer text-blue-600"
                  />
                  <Trash2
                    size={16}
                    className="cursor-pointer text-red-600"
                    onClick={() => deactivateWorkCategoryFile(file.id)}
                  />
                </div>
              </div>
            ))}

            {/* Create/Edit File Form */}
            {showFileForm && (
              <div className="border border-gray-300 rounded p-3 mt-4">
                <p className="text-sm text-gray-700 mb-2">
                  {editMode ? 'Edit File' : 'Add New File'} for <strong>{selectedWork?.name}</strong>
                </p>
                <form
                  onSubmit={editMode ? updateWorkCategoryFile : createWorkCategoryFile}
                >
                  <input
                    type="text"
                    placeholder="File Name"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 mb-2"
                    required
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      style={{ backgroundColor: selectedColor?.bg }}
                      className="px-3 py-1 rounded text-white text-sm"
                    >
                      {editMode ? 'Update' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowFileForm(false);
                        setFileName('');
                        setSelectedFile(null);
                        setEditMode(false);
                      }}
                      className="px-3 py-1 rounded border border-red-500 text-red-500 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    {/* Output Popup */}
     {openOutput && (
        <div className="absolute top-0 bottom-0 left-0 right-0 w-full flex justify-center shadow-2xl">
          <div className="bg-white shadow-2xl border w-[400px] h-fit overflow-y-auto p-4 mt-20 rounded-[10px]">
            {/* Close Popup Button */}
            <div className="w-full flex justify-end mb-2">
              <X  onClick={closeOutputPopup} size={16} className="cursor-pointer" />
            </div>

            {/* Title */}
            <div className="text-center mb-4">
              <p className="text-[16px] font-semibold">Outcome Doc For: 
                <span className="ml-2 font-normal">{selectedWork2?.name}</span>
              </p>
            </div>

            {/* Add New File Icon */}
            <div className="flex justify-end items-center mb-3">
              <Plus size={20}  className="cursor-pointer hover:opacity-80"  onClick={handleAddNewOutput} />
            </div>

            {/* File List */}
            {outputs.length === 0 && (
              <p className="text-center text-sm text-gray-500">
                No outcome doc listed.
              </p>
            )}
            {outputs.map((output, index) => (
              <div
                key={output.id}
                className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 mb-2"
              >
                <p className="text-sm">{output.file_name}</p>
                <div className="flex gap-x-2">
                  <SquarePen onClick={() => handleEditOutputDOc(output)}  size={16} className="cursor-pointer text-blue-600" />
                  <Trash2 size={16} className="cursor-pointer text-red-600"  onClick={() => deactivateWorkCategoryOutputDoc(output.id)} />
                </div>
              </div>
            ))}

            {/* Create/Edit File Form */}
            {showOutputForm && (
              <div className="border border-gray-300 rounded p-3 mt-4">
                <p className="text-sm text-gray-700 mb-2">
                  {editMode2 ? 'Edit Outcome Doc' : 'Add New Outcome Doc'} for <strong>{selectedWork2?.name}</strong>
                </p>
                <form
                  onSubmit={editMode2 ? updateWorkCategoryOutputDoc : createWorkCategoryOutputDoc}
                >
                  <input
                    type="text"
                    placeholder="Outcome Doc Name"
                    value={outputName}
                    onChange={(e) => setOutputName(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 mb-2"
                    required
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      style={{ backgroundColor: selectedColor?.bg }}
                      className="px-3 py-1 rounded text-white text-sm"
                    >
                      {editMode2 ? 'Update' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowOutputForm(false);
                        setOutputName('');
                        setSelectedOutput(null);
                        setEditMode2(false);
                      }}
                      className="px-3 py-1 rounded border border-red-500 text-red-500 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

         {/* Acitivity List Popup */}
     {openActivityList && (
        <div className="absolute top-0 bottom-0 left-0 right-0 w-full flex justify-center shadow-2xl">
          <div className="bg-white shadow-2xl border w-[400px] h-fit overflow-y-auto p-4 mt-20 rounded-[10px]">
            {/* Close Popup Button */}
            <div className="w-full flex justify-end mb-2">
              <X  onClick={closeActivityListPopup} size={16} className="cursor-pointer" />
            </div>

            {/* Title */}
            <div className="text-center mb-4">
              <p className="text-[16px] font-semibold">Activity List For: 
                <span className="ml-2 font-normal">{selectedWork3?.name}</span>
              </p>
            </div>

            {/* Add New File Icon */}
            <div className="flex justify-end items-center mb-3">
              <Plus size={20}  className="cursor-pointer hover:opacity-80"  onClick={handleAddNewActivityList} />
            </div>

            {/* File List */}
            {activityLists.length === 0 && (
              <p className="text-center text-sm text-gray-500">
                No Activity list listed.
              </p>
            )}
            {activityLists.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 mb-2"
              >
                <p className="text-sm">{activity.activity_name}</p>
                <p className="text-sm">{activity.assigned_percentage}%</p>
                <div className="flex gap-x-2">
                  <SquarePen onClick={() => handleEditActivityList(activity)}  size={16} className="cursor-pointer text-blue-600" />
                  <Trash2 size={16} className="cursor-pointer text-red-600"  onClick={() => deactivateWorkCategoryActivityList(activity.id)} />
                </div>
              </div>
            ))}

            {/* Create/Edit File Form */}
            {showActivityListForm && (
              <div className="border border-gray-300 rounded p-3 mt-4">
                <p className="text-sm text-gray-700 mb-2">
                  {editMode3 ? 'Edit Activity List' : 'Add New Activity List'} for <strong>{selectedWork3?.name}</strong>
                </p>
                <form
                  onSubmit={editMode3 ? updateWorkCategoryActivityList : createWorkCategoryActivityList}
                >
                  <input
                    type="text"
                    placeholder="Activity List Name"
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 mb-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Assigned Percentage"
                    value={assignedPercentage}
                    onChange={(e) => setAssignedPercentage(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 mb-2"
                    required
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      style={{ backgroundColor: selectedColor?.bg }}
                      className="px-3 py-1 rounded text-white text-sm"
                    >
                      {editMode3 ? 'Update' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowActivityListForm(false);
                        setActivityName('');
                        setAssignedPercentage('')
                        setSelectedActivityList(null);
                        setEditMode3(false);
                      }}
                      className="px-3 py-1 rounded border border-red-500 text-red-500 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

       {/* Acitivity Stage Popup */}
       {openActivityStage && (
            <div className="absolute top-0 bottom-0 left-0 right-0 w-full flex justify-center shadow-2xl">
              <div className="bg-white shadow-2xl border w-[400px] h-fit overflow-y-auto p-4 mt-20 rounded-[10px]">
                {/* Close Popup Button */}
                <div className="w-full flex justify-end mb-2">
                  <X  onClick={closeActivityStagePopup} size={16} className="cursor-pointer" />
                </div>
    
                {/* Title */}
                <div className="text-center mb-4">
                  <p className="text-[16px] font-semibold">Activity Stage For: 
                    <span className="ml-2 font-normal">{selectedWork4?.name}</span>
                  </p>
                </div>
    
                {/* Add New File Icon */}
                <div className="flex justify-end items-center mb-3">
                  <Plus size={20}  className="cursor-pointer hover:opacity-80"  onClick={handleAddNewActivityStage} />
                </div>
    
                {/* File List */}
                {activityStages.length === 0 && (
                  <p className="text-center text-sm text-gray-500">
                    No Activity Stage listed.
                  </p>
                )}
                {activityStages.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 mb-2"
                  >
                    <p className="text-sm">{activity.activity_stage}</p>
                    <p className="text-sm">{activity.description}</p>
                    <div className="flex gap-x-2">
                      <SquarePen onClick={() => handleEditActivityStage(activity)}  size={16} className="cursor-pointer text-blue-600" />
                      <Trash2 size={16} className="cursor-pointer text-red-600"  onClick={() => deactivateWorkCategoryActivityStage(activity.id)} />
                    </div>
                  </div>
                ))}
    
                {/* Create/Edit File Form */}
                {showActivityStageForm && (
                  <div className="border border-gray-300 rounded p-3 mt-4">
                    <p className="text-sm text-gray-700 mb-2">
                      {editMode4 ? 'Edit Activity Stage' : 'Add New Activity Stage'} for <strong>{selectedWork4?.name}</strong>
                    </p>
                    <form
                      onSubmit={editMode4 ? updateWorkCategoryActivityStage : createWorkCategoryActivityStage}
                    >
                      <input
                        type="text"
                        placeholder="Activity Stage Name"
                        value={activityStageName}
                        onChange={(e) => setActivityStageName(e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 mb-2"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 mb-2"
                        required
                      />
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          style={{ backgroundColor: selectedColor?.bg }}
                          className="px-3 py-1 rounded text-white text-sm"
                        >
                          {editMode4 ? 'Update' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowActivityStageForm(false);
                            setActivityStageName('');
                            setDesc('')
                            setSelectedActivityStage(null);
                            setEditMode4(false);
                          }}
                          className="px-3 py-1 rounded border border-red-500 text-red-500 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

      {/* MAIN: Department + Manager + import checklist */}
      <div className="w-full flex justify-end mt-3">
        <X onClick={() => setEditPage(false)} className="cursor-pointer" />
      </div>

      <div className="w-full flex justify-between">
        {/* Left - Dept Creation */}
        <div className="flex flex-col gap-y-3 mt-3">
          <div className="flex items-center h-fit gap-x-3">
            <p className="font-semibold xl:text-[18px] text-[14px] text-[#383A3E]">
              Add Department:
            </p>
            <input
              placeholder="Enter Department"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="xl:w-[286px] w-[200px] h-[41px] rounded-[10px] border border-[#D8D8D8] px-3"
            />
          </div>

          <div className="flex  gap-x-2">
            <button
              style={{ backgroundColor: selectedColor?.bg }}
              onClick={handleCreateDepartment}
              className="w-[150px] h-[41px] rounded-[8px] text-white font-semibold text-[14px]"
            >
              Add Department
            </button>
            <button
              onClick={() => {
                setName('');
                setManager('');
              }}
              className="w-[81px] h-[41px] rounded-[8px] border border-[#F22C2C] text-[#F22C2C] font-semibold text-[14px]"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Right - Manager + Import */}
        <div className="flex flex-col gap-y-3 mt-3">
          <div className="flex items-center h-fit gap-x-3">
            <p className="font-semibold xl:text-[18px] text-[14px] text-[#383A3E]">
              Select Manager:
            </p>
            <select
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              className="xl:w-[286px] w-[200px] h-[41px] rounded-[10px] border border-[#D8D8D8] px-3"
            >
              <option value="">Select Manager</option>
              {managers.map((mgr) => (
                <option
                  className="text-[#383a3e]"
                  key={mgr.employee_id}
                  value={mgr.employee_id}
                >
                  {mgr.employee_name}
                </option>
              ))}
            </select>
          </div>

          {/* <button
            style={{ backgroundColor: selectedColor?.bg }}
            className="w-[150px] h-[41px] rounded-[8px] text-white font-semibold text-[14px]"
          >
            Import Checklist
          </button> */}
        </div>
      </div>

      <div className="w-[100%] h-[1px] bg-[#E7E8EC] mx-auto mt-5"></div>

      {/* TABLE: Work Categories */}
      <div className="w-full rounded-t-[10px] overflow-x-scroll h-[600px] overflow-y-scroll pb-20 no-scrollbar">
        <table className="min-w-[300px] w-full mt-3 rounded-t-[10px] whitespace-nowrap">
          <thead style={{ backgroundColor: selectedColor?.bg || '#F9F9FB' }}>
            <tr>
              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                Sr.
              </th>
              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                Work Category
              </th>
              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                Fees
              </th>
              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                DOC Required
              </th>
              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                Activity Stage
              </th>
              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                Activity List
              </th>
              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                Outcome Doc
              </th>
              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                <button
                  onClick={() => {setSelectedWorkCategory(null); setAddNew(true); }}
                  style={{ color: selectedColor?.bg || '#F9F9FB' }}
                  className="w-[94px] h-[41px] bg-white rounded-[8px] font-semibold text-[14px]" >
                  Add New
                </button>
              </th>
            </tr>
          </thead>

          <tbody>
            {workCategories.map((work, index) => {
              return (
                <tr key={work.id}>
                  <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2 text-center">
                    {index + 1}
                  </td>

                  <td className="border border-[#D8D8D8] py-2 px-2">
                    <p className="font-medium text-[13px] text-[#62636C]">
                      {work.name}
                    </p>
                  </td>

                  <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                    <p className="font-medium text-[13px] text-[#62636C] font-poppins">
                      {formatToIndianCurrency(work.fees)}
                    </p>
                  </td>

                  {/* DOC Required count => open popup */}
                  <td onClick={() => filesClicked(work.files_required, work)}
                    className="font-medium text-[15px] text-center  text-[#62636C] border border-[#D8D8D8] py-2 px-2 cursor-pointer">
                    <p style={{ color: selectedColor?.bg || '#F9F9FB' }}
                      className="font-semibold text-[15px] underline" >
                      {work.files_required.length}
                    </p>
                  </td>

                  <td onClick={() => activityStageClicked(work.activity_stages, work)} className="font-medium text-[15px] cursor-pointer text-center text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                    <p style={{ color: selectedColor?.bg || '#F9F9FB' }}
                      className="font-semibold text-[15px] underline" >
                      {work.activity_stages.length}
                    </p>
                  </td>

                  <td onClick={() => activityListClicked(work.activities, work)} className="font-medium text-[15px] cursor-pointer text-center text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                    <p
                      style={{ color: selectedColor?.bg || '#F9F9FB' }}
                      className="font-semibold text-[15px] underline"
                    >
                      {work.activities.length}
                    </p>
                  </td>

                  <td onClick={() => outputClicked(work.output_files, work)} className="font-medium text-[15px] cursor-pointer text-center text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                    <p
                      style={{ color: selectedColor?.bg || '#F9F9FB' }}
                      className="font-semibold text-[15px] underline"
                    >
                      {work.output_files.length}
                    </p>
                  </td>

                  <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                    <div className="flex gap-x-2 justify-center">
                      <button
                        onClick={() => handleEditWorkCategory(work)}
                        style={{
                          backgroundColor: selectedColor?.three || '#F9F9FB'
                        }}
                        className="w-[46px] h-[29px] rounded-[5px] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]"
                      >
                        <SquarePen size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteWorkCategory(work.id)}
                        className="w-[30px] h-[29px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        style={{
                          backgroundColor: selectedColor?.four || '#F9F9FB'
                        }}
                        className="w-[51px] h-[29px] rounded-[5px] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]"
                      >
                        <Copy size={14} />
                        Copy
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EditAccounting;
