import React, { ChangeEventHandler } from "react"
import { FormikProps } from "formik"
import { motion } from "framer-motion"
import {
  defaultFieldsetStyle,
  defaultHelperTextStyle,
  defaultInputErrorMessageStyle,
  defaultInputErrorStyle,
  defaultInputLabelStyle,
  defaultInputStyle,
  inputCheckIcon,
  permaInputPlaceHolderStyle,
} from "./styles.css"
import { CheckIcon } from "@radix-ui/react-icons"
import { isEmpty, walletSnippet } from "utils/helpers"

interface SmartInputProps {
  id: string
  value: string | number
  type: string
  inputLabel?: string
  onChange: ChangeEventHandler
  onBlur: ChangeEventHandler
  formik?: FormikProps<any>
  errorMessage?: any
  helperText?: string
  autoSubmit?: boolean
  max?: number
  min?: number
  perma?: string
  placeholder?: string
  step?: number
  ensIsValid?: boolean
  submitCallback?: (values: any) => void
  disabled: boolean | undefined
}

const SmartInput: React.FC<SmartInputProps> = ({
  id,
  value,
  type,
  inputLabel,
  onChange,
  autoSubmit,
  formik,
  errorMessage,
  helperText,
  max,
  perma,
  placeholder,
  step = 0.001,
  ensIsValid,
  submitCallback,
  disabled = false,
}) => {
  /*
  
    add autocomplete to refs (autocomplete not supported ref in types)
  
    */
  const input = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (input.current !== null) {
      input.current.setAttribute("autocomplete", "off")
    }
  }, [input])

  /*
  
      handlers: blur, focus
  
      */
  const [isFocus, setIsFocus] = React.useState<boolean>(false)
  const handleBlur = () => {
    setIsFocus(false)
    if (autoSubmit && formik) {
      formik.submitForm()

      if (submitCallback && isEmpty(formik.errors)) {
        submitCallback(formik.values)
      }
    }
  }

  const handleFocus = () => {
    setIsFocus(true)
  }

  const helperVariants = {
    init: {
      height: 0,
      overflow: "hidden",
    },
    open: {
      height: "auto",
    },
  }

  return (
    <fieldset className={`mb-8 p-0 ${defaultFieldsetStyle}`}>
      {inputLabel && <label className={defaultInputLabelStyle}>{inputLabel}</label>}
      {errorMessage && (
        <div className={`absolute right-2 top-8 text-sm ${defaultInputErrorMessageStyle}`}>{errorMessage}</div>
      )}
      <input
        id={id}
        type={type}
        onChange={onChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        value={ensIsValid ? walletSnippet(value) : value || ""}
        className={!!errorMessage ? defaultInputErrorStyle : defaultInputStyle}
        min={0}
        max={max}
        step={step}
        placeholder={perma || placeholder || ""}
        ref={input}
        disabled={disabled}
      />
      {ensIsValid && (
        <div className={`absolute flex items-center justify-center ${inputCheckIcon["default"]}`}>
          <CheckIcon color={"#fff"} height={"22px"} width={"22px"} />
        </div>
      )}
      {(typeof value === "number" || value) && perma ? (
        <div className={`absolute ${permaInputPlaceHolderStyle}`}>{perma}</div>
      ) : null}
      <motion.div variants={helperVariants} initial={"init"} animate={isFocus ? "open" : "init"}>
        {!!helperText && helperText?.length > 0 ? <div className={defaultHelperTextStyle}>{helperText}</div> : null}
      </motion.div>
    </fieldset>
  )
}

export default SmartInput
