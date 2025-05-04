import {JSX, useEffect, useState} from 'react';
import './index.css'
import axios from 'axios';
import { notifyError } from '../../../../_utils/toastMessage';
import Loading from '../../../components/Loading';
import Profile from '../../../../interface/Profile';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Users(): JSX.Element{
    const [users, setUsers] = useState<Profile[] | null>(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()

    useEffect(() => {
        const getUsers = async() => {
            setLoading(true);
            try{
                const response = await axios.get('/api/Users/');

                setUsers(response.data);
                setLoading(false);
            }catch{
                setLoading(false);
                notifyError('Não foi possivel adquirir os usuários. Volte novamente mais tarde.', '')
            }
        }

        getUsers();
    }, [])

    useEffect(() => {
        const SearchUser = async () => {
            if (!search.includes('#') || search.split('#')[1]?.length !== 6) return;
    
            setLoading(true);
            try {
                const response = await axios.post('/api/Users/ByName', { name: search });
                setUsers(response.data);
            } catch {
                notifyError('Não foi possível encontrar o usuário.', '');
            } finally {
                setLoading(false);
            }
        };
    
        if (search) SearchUser();
    }, [search]);

    const viewBtnFn = (user_id: number) => {
        navigate(`/profile/${user_id}`)
    }

    const viewGamesBtnFn = (user_id: number) => {
        navigate(`/playlist/${user_id}`)
    }
    

    if(loading) return <Loading isLoading={loading} />

    return (
        <>
            <div className="title">
                <h1>Usuários</h1>
            </div>

            <div className="search-container">
                <input type="text" name="users" id="users" placeholder='Nome e tag do usuário. Ex: nome#123456' value={search} onChange={(e) => setSearch(e.target.value)}/>
            </div>

            <div className="users-container">
                {users?.map((user) => (
                    <div className="card">
                        <FaUserCircle size={'100px'} />
                        <h3>{user?.name}</h3>
                        <p>{user?.email}</p>
                        <div className="btn-actions">
                            <button onClick={() => viewBtnFn(user.id)} className="View-btn">Visualizar</button>
                            <button onClick={() => viewGamesBtnFn(user.id)} className="viewGamesBtn">Ver jogos</button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}