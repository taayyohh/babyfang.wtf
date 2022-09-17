import Date from "./Date"
import Radio from "./Radio"
import Select from "./Select"
import SmartInput from "./SmartInput"
import TextArea from "./TextArea"
import {
  DATE,
  NUMBER,
  RADIO,
  RICH_TEXT,
  SELECT,
  SINGLE_AUDIO_UPLOAD,
  SINGLE_IMAGE_UPLOAD,
  TEXT,
  TEXTAREA,
} from "./types"
import { ethers } from "ethers"
import { FormikProps } from "formik"
import dynamic from "next/dynamic"
import React, { BaseSyntheticEvent, ReactNode } from "react"
import { compareAndReturn } from "utils/helpers"
import { useEnsAddress } from "wagmi"
import SingleImageUpload from "./SingleImageUpload"
import SingleAudioUpload from "./SingleAudioUpload"

const RichText = dynamic(() => import("./RichText"), {
  ssr: false,
})

interface FieldSwitchProps {
  field: {
    type: string
    name: string
    inputLabel: string
    helperText?: string
    max?: number
    min?: number
    perma?: string
    step?: number
    placeholder?: any
    disabled?: boolean
    minHeight?: number
  }
  formik: FormikProps<any>
  autoSubmit?: boolean
  children?: ReactNode
  setHasConfirmed?: (hasConfirmed: { state: boolean | null; values: {}[] }) => void
  hasConfirmed?: { state: boolean | null; values: {}[] | null }
  options?: any[] | {}
  submitCallback?: (values: any) => void
  parentValues?: any
}

const FieldSwitch: React.FC<FieldSwitchProps> = ({
  field,
  formik,
  autoSubmit,
  submitCallback,
  setHasConfirmed,
  hasConfirmed,
  options,
  parentValues,
}) => {
  /*

          handle ens name

       */
  interface ensFieldProps {
    address: string
    formik: FormikProps<any>
    name: string
  }

  const [ensIsValid, setEnsIsValid] = React.useState<boolean>(false)
  const [ensField, setEnsField] = React.useState<ensFieldProps | null>(null)
  const { data: addressOfEns } = useEnsAddress({
    name: ensField?.address || "",
    chainId: 1,
  })

  React.useEffect(() => {
    if (!!addressOfEns && !!ensField) {
      ensField.formik?.setFieldValue(ensField.name, addressOfEns)
      setEnsIsValid(true)
    }
  }, [addressOfEns, ensField])

  React.useEffect(() => {
    /*

          compare initial values against entered values
          and null confirmation of changes on value change

        */
    if (!!hasConfirmed?.state && !!setHasConfirmed) {
      let updates = compareAndReturn(formik.initialValues, formik.values)

      setHasConfirmed({ state: hasConfirmed.state, values: updates })
    }
  }, [formik.values])

  /*

          handle smartInput onChange

     */
  const handleChange = (e: BaseSyntheticEvent) => {
    const { value } = e.target
    if (!formik) return
    /*

            custom field handling

         */
    if (field.name === "daoName") {
      formik.setFieldValue(
        "daoSymbol",
        `$${value
          .toUpperCase()
          .replace(/[AEIOU\s]/g, "")
          .slice(0, 4)}`
      )
    }

    if (field.name === "founderAddress" || field.name === "transactionContractAddress") {
      if (!ethers.utils.isAddress(value)) {
        setEnsField({
          formik,
          address: value,
          name: field.name,
        })
      } else {
        setEnsIsValid(true)
      }
    }

    formik.setFieldValue(field.name, field.type === NUMBER ? Number(value) : value)
  }

  switch (field.type) {
    case DATE:
      return (
        <Date
          {...formik.getFieldProps(field.name)}
          inputLabel={field.inputLabel}
          formik={formik}
          id={field.name}
          errorMessage={formik.touched[field.name] && formik.errors[field.name] ? formik.errors[field.name] : undefined}
          placeholder={field.placeholder}
          autoSubmit={autoSubmit}
          submitCallback={submitCallback}
          parentValues={parentValues}
        />
      )
    case RADIO:
      return (
        <Radio
          {...formik.getFieldProps(field.name)}
          inputLabel={field.inputLabel}
          formik={formik}
          id={field.name}
          placeholder={field.placeholder}
          options={options}
          errorMessage={formik.touched[field.name] && formik.errors[field.name] ? formik.errors[field.name] : undefined}
        />
      )
    case SINGLE_IMAGE_UPLOAD:
      return (
        <SingleImageUpload
          {...formik.getFieldProps(field.name)}
          formik={formik}
          id={field.name}
          inputLabel={field.inputLabel}
          helperText={field.helperText}
        />
      )
    case SINGLE_AUDIO_UPLOAD:
      return (
        <SingleAudioUpload
          {...formik.getFieldProps(field.name)}
          formik={formik}
          id={field.name}
          inputLabel={field.inputLabel}
          helperText={field.helperText}
        />
      )
    case SELECT:
      return (
        <Select
          options={options}
          {...formik.getFieldProps(field.name)}
          inputLabel={field.inputLabel}
          formik={formik}
          id={field.name}
        />
      )
    case TEXT:
    case NUMBER:
      return (
        <SmartInput
          {...formik.getFieldProps(field.name)}
          inputLabel={field.inputLabel}
          type={field.type}
          formik={formik}
          id={field.name}
          onChange={(e: BaseSyntheticEvent) => {
            handleChange(e)
          }}
          onBlur={formik.handleBlur}
          helperText={field.helperText}
          errorMessage={formik.values[field.name] && formik.errors[field.name] ? formik.errors[field.name] : undefined}
          autoSubmit={autoSubmit}
          submitCallback={submitCallback}
          max={field.max}
          perma={field.perma}
          placeholder={field.placeholder}
          step={field.step}
          ensIsValid={ensIsValid}
          disabled={field.disabled}
        />
      )

    case RICH_TEXT:
      return (
        <RichText
          {...formik.getFieldProps(field.name)}
          inputLabel={field.inputLabel}
          formik={formik}
          id={field.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={field.helperText}
          errorMessage={formik.values[field.name] && formik.errors[field.name] ? formik.errors[field.name] : undefined}
          autoSubmit={autoSubmit}
          placeholder={field.placeholder}
        />
      )
    case TEXTAREA:
      return (
        <TextArea
          {...formik.getFieldProps(field.name)}
          inputLabel={field.inputLabel}
          formik={formik}
          id={field.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={field.helperText}
          errorMessage={formik.values[field.name] && formik.errors[field.name] ? formik.errors[field.name] : undefined}
          autoSubmit={autoSubmit}
          placeholder={field.placeholder}
          minHeight={field.minHeight}
        />
      )
    default:
      return null
  }
}

export default FieldSwitch
