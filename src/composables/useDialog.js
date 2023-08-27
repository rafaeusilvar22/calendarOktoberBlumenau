import { useQuasar } from "quasar";

export default function useDialog() {
  const $q = useQuasar();

  const DialogConfirm = (message) => {
    $q.dialog({
      color: "primary",
      title: message.title,
      message: `${message.details} - ${message.time}H`,
    })
      .onOk(() => {
        // console.log('OK')
      })
      .onCancel(() => {
        // console.log('Cancel')
      })
      .onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      });
  };

  return {
    DialogConfirm,
  };
}
