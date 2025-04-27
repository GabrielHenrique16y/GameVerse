import { toast } from "react-toastify";

export const notifySuccess = (msg: string, icon: string) => {
    toast.success(msg, {
      icon: <span>{icon}</span>,
    });
  };

  export const notifyError = (msg: string, icon: string) => {
  toast.error(msg, {
    icon: <span>{icon}</span>,
  });
};

export const notifyInfo = (msg: string, icon: string) => {
  toast.info(msg, {
    icon: <span>{icon}</span>,
  });
};

export const notifyWarning = (msg: string, icon: string) => {
  toast.warning(msg, {
    icon: <span>{icon}</span>,
  });
};