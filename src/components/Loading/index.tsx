import { JSX } from "react";

import './index.css'

import IsLoading from "../../../interface/isLoading";

export default function Loading({ isLoading }: IsLoading): JSX.Element {
    if (!isLoading) return <></>
    return (
        <div className="loading-container">
            <div className="logo">Game<span>Verse</span></div>
            <div className="spinner"></div>
            <p className="loading-text">Carregando, por favor aguarde...</p>
        </div>
    )
}