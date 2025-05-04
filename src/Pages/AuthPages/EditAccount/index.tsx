import { FormEvent, JSX, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { notifyError, notifySuccess } from "../../../../_utils/toastMessage";
import Loading from "../../../components/Loading";
import { useAuth } from "../../../context/AuthContext";
import Cookies from "js-cookie";

export default function EditAccount(): JSX.Element {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate()
    const {id} = useParams()
    const {setUser} = useAuth()

    useEffect(() => {
        const getData = async() => {
            setLoading(true);
            try{
                const response = await axios.post('/api/auth', {
                    action: 'ById',
                    payload: { id }
                })

                setUsername(response.data.name);
                setEmail(response.data.email);
                setLoading(false);
            }catch{
                setLoading(false);
                notifyError('Não foi possivel adquirir os dados do cliente!', '')
            }
        }

        getData()
    }, [])

    const SubmitEditAccountFn = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        setLoading(true);

        try {
            await axios.post('/api/auth', {
                action: 'Update',
                payload: {
                    id,
                    name: username,
                    email,
                    password,
                }
            });
            setLoading(false);
            notifySuccess('Conta criada com sucesso!', '✅');
            navigate('/')
        
            const userData = JSON.parse(Cookies.get('user') || '{}');
            setUser(userData);
        } catch (err: any) {
            console.log(err);
            setLoading(false);

            if (err.response && err.response.data && err.response.data.errors) {
                setError(err.response.data.errors.join(' '));
            } else {
                setError('Erro ao editar. Tente novamente.');
            }

            notifyError('Erro ao editar. Tente novamente.', '❌');
        }

    };

    if(loading) return <Loading isLoading={loading} />


    return (
        <div className="center">
            <div className="register-container">
                {error && <div className="error-message">{error}</div>}
                <div className="logo">Game<span>Verse</span></div>

                <form className="register-form" onSubmit={SubmitEditAccountFn}>
                    <input type="text" value={username} name="username" placeholder="Nome de Usuário" onChange={(e) => setUsername(e.target.value)} />
                    <input type="email" value={email} name="email" placeholder="E-mail" onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" value={password} name="password" placeholder="Senha" onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit">
                        Editar
                    </button>
                </form>
            </div>
        </div>
    )
}