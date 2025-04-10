import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useColor } from '../ColorContext/ColorContext';

const SideBar = ({active, setActive}) => {

      const { selectedColor } = useColor();
      const tabs = [
        {
          name: "Dashboard",
          icon: "/assets/Dashboard.svg",
          icon2: "/assets/Dashboard.svg",
          link: "/main/dashboard"
        },
        {
          name: "Users",
          icon: "/assets/Users.svg",
          icon2: "/assets/UsersH.svg",
          link: "/main/users"
        },
        {
          name: "Clients",
          icon: "/assets/Clients.svg",
          icon2: "/assets/ClientsH.svg",
          link: "/main/clients",
          subMenu: [
            {
              name: "Clients",
              link: "/main/clients/clients"
            },
            {
              name: "Inquiry Form",
              link: "/main/clients/inquiry-form"
            },
            {
              name: "Client Inquiries",
              link: "/main/clients/clientinquiries"
            },
            {
              name: "Groups",
              link: "/main/clients/groups"
            },
            {
              name: "Branches",
              link: "/main/clients/branches"
            },
          ]
        },
        {
          name: "Departments",
          icon: "/assets/Department.svg",
          icon2: "/assets/DepartmentH.svg",
          link: "/main/departments"
        },
        {
          name: "Tasks",
          icon: "/assets/Tasks.svg",
          icon2: "/assets/TasksH.svg",
          link: "/main/tasks",
          subMenu: [
            {
              name: "Tasks",
              link: "/main/tasks/tasks"
            },
            {
              name: "Create Task",
              link: "/main/tasks/create-task"
            },
            {
              name: "Create Schedule",
              link: "/main/tasks/create-schedule"
            },
            
          ]
        },
        {
          name: "Tasks Review",
          icon: "/assets/Receipt.svg",
          icon2: "/assets/Receipt.svg",
          link: "/main/tasks-review"
        },
        {
          name: "HR",
          icon: "/assets/HR.svg",
          icon2: "/assets/HR.svg",
          link: "/main/hr",
          subMenu: [
            {
              name: "Create Bill",
              link: "/main/hr/create-bill"
            },
            {
              name: "Billing",
              link: "/main/hr/billing"
            },
            {
              name: "Attendance",
              link: "/main/hr/attendance"
            },
            {
              name: "Request Attendance",
              link: "/main/hr/request-attendance"
            },
            {
              name: "Attendance Register",
              link: "/main/hr/attendance-register"
            },
            {
              name: "User Leave Register",
              link: "/main/hr/user-leave-register"
            },
            {
              name: "Assign Users Leaves",
              link: "/main/hr/users-leaves"
            },
            {
              name: "Time Tracker",
              link: "/main/hr/time-tracker"
            },
            {
              name: "Holidays",
              link: "/main/hr/holiday-manager"
            },
            {
              name: "Receipt",
              link: "/main/hr/receipt"
            },
            {
              name: "Credit/Debit Notes",
              link: "/main/hr/credit-debit-notes"
            },
            {
              name: "Expense",
              link: "/main/hr/expense"
            },
            // {
            //   name: "Voucher Register",
            //   link: "/main/hr/voucher-register"
            // },
            {
              name: "DSC Register",
              link: "/main/hr/dsc-register"
            },
            // {
            //   name: "My Voucher",
            //   link: "/main/hr/my-voucher"
            // },
          ]
        },
        {
          name: "Utilities",
          icon: "/assets/Utilities.svg",
          icon2: "/assets/Utilities.svg",
          link: "/main/utilities",
          subMenu: [
            {
              name: "Manage Company",
              link: "/main/utilities/manage-company"
            },
            {
              name: "Manage Banks",
              link: "/main/utilities/manage-banks"
            },
            {
              name: "Manage Teams",
              link: "/main/utilities/manage-teams"
            },
            {
              name: "DSC Register",
              link: "/main/utilities/dsc-register"
            },
            {
              name: "Send Reminder",
              link: "/main/utilities/send-reminder"
            },
            {
              name: "Leave Register",
              link: "/main/utilities/leave-register"
            },
            {
              name: "Send Bill Due Reminder",
              link: "/main/utilities/send-bill-due-reminder"
            },
            {
              name: "Inward / Outward",
              link: "/main/utilities/inward-outward"
            },
            {
              name: "Locations",
              link: "/main/utilities/createlocation"
            },
          ]
        },
        {
          name: "Imports",
          icon: "/assets/Import.svg",
          icon2: "/assets/Import.svg",
          link: "/main/imports",
          subMenu: [
            {
              name: "Import DSC",
              link: "/main/imports/dsc"
            },
            {
              name: "Import Required Files",
              link: "/main/imports/required-files"
            },
            {
              name: "Import Activity List",
              link: "/main/imports/activity-list"
            },
            {
              name: "Import Output Files",
              link: "/main/imports/output-files"
            },
          ]
        },
        {
          name: "Reports",
          link: "/main/reports",
          icon: "/assets/Reports.svg",
          icon2: "/assets/Reports.svg",
          
        },
      ];
      

    const location = useLocation()
    const [hoveredTab, setHoveredTab] = useState(null);
    const [expandedTab, setExpandedTab] = useState(null);
    const handleToggle = (tabName) => {
        setExpandedTab((prev) => (prev === tabName ? null : tabName));
      };
      
      
      const [manualClose, setManualClose] = useState(false);
      
      useEffect(() => {
        let foundActive = false;
      
        for (const tab of tabs) {
          if (tab.link === location.pathname) {
            setActive(tab.name);
            setExpandedTab(null);
            foundActive = true;
            break;
          }
      
          if (tab.subMenu) {
            for (const sub of tab.subMenu) {
              if (sub.link === location.pathname) {
                setActive(sub.name);
                // Only auto-expand if user didn't just click
                if (!manualClose && expandedTab !== tab.name) {
                  setExpandedTab(tab.name);
                }
                foundActive = true;
                break;
              }
            }
            if (foundActive) break;
          }
        }
      
        if (!foundActive) setActive("");
      }, [location.pathname, manualClose]);
      
    return (
        <div className='w-[6%] h-screen  bg-white flex flex-col items-center border-r border-r-[#E7E8EC] relative'>
            <img src="/assets/CA logo.svg" className='w-[60%] mx-auto mt-5 ' />

            <div className='flex flex-col items-center w-[100%] mt-10'>
            {tabs.map((tab, index) => {
  const isActive = active === tab.name;         // for parent tab
  const isExpanded = expandedTab === tab.name;  // check if this tab is expanded

  return (
    <div
      key={index}
      className="w-[100%] flex flex-col items-start"
      onMouseEnter={() => setHoveredTab(tab.name)}
      onMouseLeave={() => setHoveredTab(null)}
    >
      {/* PARENT TAB */}
      <div className="w-full flex items-center gap-x-1 relative">
        {/* Active indicator bar */}
        {isActive ? (
          <div
            style={{ backgroundColor: selectedColor?.bg }}
            className="w-[7px] h-[40px] rounded-r-[6px]"
          />
        ) : (
          <div className="w-[7px] h-[40px] rounded-r-[6px] bg-transparent" />
        )}

        {/* Either link or a toggle if subMenu */}
        {tab.subMenu ? (
          <div
            className="cursor-pointer w-full flex items-center "
            onClick={() => handleToggle(tab.name)}
          >
            <div
              style={{
                backgroundColor: isActive
                  ? selectedColor?.highlight
                  : "transparent",
              }}
              className="w-[80%] h-[60px] rounded-[6px] flex justify-center items-center"
            >
              <img src={tab.icon} alt={tab.name} />
            </div>
          </div>
        ) : (
          <Link to={tab.link} className="w-full flex items-center">
            <div
              style={{
                backgroundColor: isActive
                  ? selectedColor?.highlight
                  : "transparent",
              }}
              className="w-[80%] h-[60px] rounded-[6px] flex justify-center items-center"
            >
              <img src={tab.icon} alt={tab.name} />
            </div>
          </Link>
        )}

        {/* Hovered tab name */}
        {hoveredTab === tab.name && (
          <div className="tooltip absolute  left-[90%] z-50 bg-[#181818] text-white text-sm font-medium px-2 py-1 rounded shadow-md">
            {tab.name}
          </div>
        )}
      </div>

      {/* SUB MENU ITEMS */}
      {tab.subMenu && isExpanded && (
        <div className="subMenuList absolute max-h-[220px] overflow-y-scroll no-scrollbar left-[90%] z-50 mt-2 flex flex-col rounded-md ">
          {tab.subMenu.map((sub, idx) => {
            const isSubActive = active === sub.name;
            return (
              <Link to={sub.link} key={idx} onClick={()=>{setExpandedTab(null); setManualClose(true)}}
               className="w-full relative">
                {/** Submenu highlight if active */}
                <div
                  style={{
                    backgroundColor: isSubActive
                      ? selectedColor?.highlight
                      : "#ffffff",
                  }}
                  className="w-full px-3 py-2 flex items-center gap-x-2"
                >
                  <span className="text-[10px] font-semibold whitespace-nowrap text-[#383A3E]">
                    {sub.name}
                  </span>
                </div>

                {/* Optionally you can add a hover tooltip same as main tabs */}
                {hoveredTab === sub.name && (
                  <div className="absolute left-[100%] z-50 bg-[#181818] text-white text-sm font-medium px-2 py-1 rounded shadow-md">
                    {sub.name}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
             })}

            </div>
        </div>
    );
};

export default SideBar;
