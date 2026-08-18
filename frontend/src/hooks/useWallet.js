import { useState, useEffect } from "react";
import { ethers } from "ethers";

const useWallet = () => {
    const [account, setAccount] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!window.ethereum){
            setError("Please install MetaMask");
            return;
        }

        window.ethereum.request({ method: "eth_accounts" })
            .then((accounts) => {
                if (accounts && accounts.length > 0) {
                    setAccount(accounts[0]);
                }
            })
            .catch((err) => console.error("Error checking accounts:", err));

        const handleAccountsChanged = (accounts) => {
            setAccount(accounts[0] || null);
        };

        window.ethereum.on("accountsChanged", handleAccountsChanged);

        return () => {
            window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        };
    }, []);

    const connectWallet = async () => {
        try{
        const provider = new ethers.BrowserProvider(window.ethereum);
        setError(null);
        const accounts = await provider.send("eth_requestAccounts", []);
        if(accounts.length === 0){
            setError("No accounts found!");
            return;
        }
        setAccount(accounts[0]);
        } catch(error){
        setError(error.message);
        }
    }

    return { account, error, connectWallet };
}

export default useWallet;
