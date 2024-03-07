import PinInput from "react-pin-input";

interface ComponentProps {
  length: number;
  onChange: (value: string, index: number) => void;
  onComplete: (value: string, index: number) => void;
}

export const SecretPinInput = (
  props: React.PropsWithChildren<ComponentProps>
) => {
  return (
    <PinInput
      length={props.length}
      initialValue=""
      secret
      secretDelay={250}
      onChange={props.onChange}
      type="numeric"
      inputMode="number"
      inputStyle={{ borderColor: "#AAAAAA" }}
      inputFocusStyle={{ borderColor: "black" }}
      onComplete={props.onComplete}
      autoSelect={true}
      regexCriteria={/^[ 0-9]*$/}
    />
  );
};
