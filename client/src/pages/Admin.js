import React, { useEffect, useState } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RecommendationstModal from '../components/RecommendationsModal';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Admin.css'
import './AddRecipe.css'

const Admin = () => {
  const navigate = useNavigate();
  const [name, setName] = useState(null);
  const [ageData, setAgeData] = useState([]);
  const [frequency, setFrequency] = useState('');
  const [initFrequency, setInitFrequency] = useState('');
  const [transformedData, setTransformedData] = useState([]);
  const [isChanged, setIsChanged] = useState(false);
  const [activityData, setActivityData] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);


  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const response = await axios.get('http://localhost:1337/api/admin/top-active-users');
        setTopUsers(response.data);
      } catch (error) {
        console.error('Error fetching top active users:', error);
      }
    };

    fetchTopUsers();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:1337/api/admin/activity_summary');
        setActivityData(response.data);

      } catch (error) {
        console.error('Error fetching activity data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCurrentFrequency = async () => {
      try {
        const response = await fetch('http://localhost:1337/api/admin/current_frequency');
        const data = await response.json();
        if (response.ok) {
          setFrequency(data.frequency);
          setInitFrequency(data.frequency)
        } else {
          console.error('Failed to fetch current frequency:', data.error);
        }
      } catch (error) {
        console.error('Error fetching current frequency:', error);
      }
    };

    fetchCurrentFrequency();
  }, []);

  const handleFrequencyChange = (event) => {
    const newFrequency = event.target.value;
    setFrequency(newFrequency);
    setIsChanged(newFrequency !== initFrequency); // Check if the frequency has changed using the new value directly
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:1337/api/admin/update_frequency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frequency }),
      });

      const result = await response.json();

      if (response.ok) {
        setInitFrequency(frequency);
        setIsChanged(false); // Reset change state
        // Optionally show a success message to the admin
      } else {
        console.error('Failed to update frequency:', result.message);
      }
    } catch (error) {
      console.error('Error updating frequency:', error);
    }
  };


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = jwt_decode(token);
      setName(user.name);
      if (!user) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetch('http://localhost:1337/api/admin/user-ages')  // Assume this endpoint returns age data
      .then(res => res.json())
      .then(data => setAgeData(data))
      .catch(error => console.error(error));
  }, []);


  useEffect(() => {
    setTransformedData(transformAgeData(ageData));
  }, [ageData]);


  const transformAgeData = (data) => {
    const ageRanges = {
      '15-19': 0,
      '20-29': 0,
      '30-39': 0,
      '40-49': 0,
      '50-59': 0,
      '60+': 0,
    };

    data.forEach(({ age, count }) => {
      if (age < 15) return;

      if (age <= 19) ageRanges['15-19'] += count;
      else if (age <= 29) ageRanges['20-29'] += count;
      else if (age <= 39) ageRanges['30-39'] += count;
      else if (age <= 49) ageRanges['40-49'] += count;
      else if (age <= 59) ageRanges['50-59'] += count;
      else ageRanges['60+'] += count;
    });

    return Object.keys(ageRanges).map(range => ({
      age: range,
      count: ageRanges[range],
    }));
  };

  const frequencyMapping = {
    'every-min': 'Every Minute (For Debug)',
    'once-a-week': 'Once a Week',
    'twice-a-week': 'Twice a Week',
    'everyday': 'Everyday',
  };

  const getReadableFrequency = (frequency) => {
    return frequencyMapping[frequency] || 'Unknown Frequency';
  };



  return (
    <div>
      {name && <Navbar name={name} />}
      <div className='admin-page-main-container'>

        <div className='admin-page-head'>
          <div className='admin-page-main-title'>
            Admin Analytics and Settings
          </div>
          <img src='../images/admin-img.png' alt='Admin Portal' className='admin-page-image' />
        </div>

        <div className='admin-page-bottom'>

          <div className='admin-main-section'>
            <div className='admin-orange-title'>Data Dashboard</div>

            <div className='graphs-line'>

              <div className='admin-data-section ages-section'>
                <span className='admin-bold-title graph-title'>User Ages</span>

                <ResponsiveContainer className="ages-grpah" width="100%" height={400}>
                  <BarChart data={transformedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#FFA07A" />
                  </BarChart>
                </ResponsiveContainer>

              </div>

              <div className='admin-data-section ages-section'>
                <span className='admin-bold-title graph-title'>Activity Summary (Last Week)</span>

                <ResponsiveContainer className="ages-grpah" width="100%" height={400}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#FFB347" />
                  </BarChart>
                </ResponsiveContainer>

              </div>

            </div>


          </div>


          <div className='freq-most-active-line'>

            <div className='admin-main-section freq-section'>
              <div className='admin-orange-title'>Recommendation System Settings</div>

              <div className='admin-freq-data'>
                <div className='admin-bold-title freq-sub-title'>Updates Frequency</div>

                <div className='curr-freq-container'>
                  <span className='curr-freq-title'> Current Frequency:</span>
                  <span>{getReadableFrequency(initFrequency)}</span>
                </div>

                <form className="admin-select-form" onSubmit={handleSubmit}>
                  <div className='admin-select-menu'>
                    <select
                      id="admin-select-window"
                      className='input-field step-input measure-input'
                      value={frequency}
                      onChange={handleFrequencyChange}
                      required
                    >
                      <option value='every-min'>Every Minute (For Debug)</option>
                      <option value='once-a-week'>Once a Week</option>
                      <option value='twice-a-week'>Twice a Week</option>
                      <option value='everyday'>Everyday</option>
                    </select>
                  </div>
                  <div className='admin-update-btn-wrapper'>
                    <button className='admin-update-btn' type='submit' disabled={!isChanged}>
                      Update Frequency
                    </button>
                  </div>
                </form>

              </div>

            </div>


            <div className='admin-main-section leaders-section'>
              <div className='admin-orange-title'>Top Most Active Users</div>

              <div className='admin-leaders-table'>

                {topUsers.length === 0 ? (
                  <div className='no-active-users'>
                    <p>No active users found in the last week.</p>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Number of Activities</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topUsers.map((user, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{user.userName}</td>
                          <td>{user.activityCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

              </div>
            </div>
          </div>

          <button id="verify-rec-link" type="button" className="btn btn-link" onClick={() => setShowModal(true)}>
            <i className="bi bi-check-circle"></i> Verify User Recommendations
          </button>




          {showModal &&
            <RecommendationstModal
              showModal={showModal}
              onClose={() => setShowModal(false)}
            />
          }

        </div>

      </div>
    </div>
  );
}

export default Admin;


