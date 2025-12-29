import Swal from 'sweetalert2';

const customColors = {
  primary: '#a60054',
  secondary: '#211f60',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export const showSuccessAlert = (message: string, title: string = 'Success!') => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonColor: customColors.primary,
    confirmButtonText: 'OK',
    background: 'linear-gradient(135deg, rgba(10, 0, 21, 0.95) 0%, rgba(33, 31, 96, 0.95) 100%)',
    color: '#ffffff',
    backdrop: 'rgba(10, 0, 21, 0.7)',
    customClass: {
      popup: 'custom-swal-popup',
      title: 'custom-swal-title',
      confirmButton: 'custom-swal-button',
    },
  });
};

export const showErrorAlert = (message: string, title: string = 'Error!') => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonColor: customColors.primary,
    confirmButtonText: 'Try Again',
    background: 'linear-gradient(135deg, rgba(10, 0, 21, 0.95) 0%, rgba(33, 31, 96, 0.95) 100%)',
    color: '#ffffff',
    backdrop: 'rgba(10, 0, 21, 0.7)',
    customClass: {
      popup: 'custom-swal-popup',
      title: 'custom-swal-title',
      confirmButton: 'custom-swal-button',
    },
  });
};

export const showWarningAlert = (message: string, title: string = 'Warning!') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonColor: customColors.primary,
    confirmButtonText: 'OK',
    background: 'linear-gradient(135deg, rgba(10, 0, 21, 0.95) 0%, rgba(33, 31, 96, 0.95) 100%)',
    color: '#ffffff',
    backdrop: 'rgba(10, 0, 21, 0.7)',
    customClass: {
      popup: 'custom-swal-popup',
      title: 'custom-swal-title',
      confirmButton: 'custom-swal-button',
    },
  });
};

export const showConfirmAlert = async (
  message: string,
  title: string = 'Are you sure?',
  confirmText: string = 'Yes',
  cancelText: string = 'Cancel'
) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: customColors.primary,
    cancelButtonColor: customColors.secondary,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    background: 'linear-gradient(135deg, rgba(10, 0, 21, 0.95) 0%, rgba(33, 31, 96, 0.95) 100%)',
    color: '#ffffff',
    backdrop: 'rgba(10, 0, 21, 0.7)',
    customClass: {
      popup: 'custom-swal-popup',
      title: 'custom-swal-title',
      confirmButton: 'custom-swal-button',
      cancelButton: 'custom-swal-cancel-button',
    },
  });
};

export const showLoadingAlert = (message: string = 'Please wait...') => {
  return Swal.fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: false,
    background: 'linear-gradient(135deg, rgba(10, 0, 21, 0.95) 0%, rgba(33, 31, 96, 0.95) 100%)',
    color: '#ffffff',
    backdrop: 'rgba(10, 0, 21, 0.7)',
    didOpen: () => {
      Swal.showLoading();
    },
    customClass: {
      popup: 'custom-swal-popup',
      title: 'custom-swal-title',
    },
  });
};

export const closeAlert = () => {
  Swal.close();
};
