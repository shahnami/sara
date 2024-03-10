import { useEffect, useState } from "react";
import {
  extractViewingPrivateKeyNode,
  generateEphemeralPrivateKey,
  generateStealthAddresses,
} from "@fluidkey/stealth-account-kit";
import { privateKeyToAccount } from "viem/accounts";
import { parallelLimit } from "async";
import {
  Box,
  Button,
  Code,
  Collapse,
  NumberInput,
  Progress,
  Switch,
  TextInput,
} from "@mantine/core";
import { IconArrowLeft, IconList } from "@tabler/icons-react";

import { StepContent } from "@components/StepContent";
import { CopyWithCheckButton } from "@components/common/CopyButton";

import {
  FluidKeyMetaStealthKeyPair,
  FluidKeyStealthSafeAddressGenerationParams,
  SupportedChainId,
} from "@typing/index";

import {
  MAX_BATCH_SIZE,
  createCSVEntry,
  defaultExportHeaders,
  validateSettings,
} from "./Journey.model";

interface ComponentProps {
  chainId: number;
  keys: FluidKeyMetaStealthKeyPair | undefined;
  onStealthDataProcessed: (data: string[][]) => void;
  onBack: () => void;
}

export const RecoverAddressesJourneyStep = (props: ComponentProps) => {
  const [openSettings, setOpenSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSettingsValid, setSettingsValid] = useState(true);
  const [settings, setSettings] =
    useState<FluidKeyStealthSafeAddressGenerationParams>({
      chainId: 0,
      startNonce: 0,
      endNonce: 5,
      safeVersion: "1.3.0",
      useDefaultAddress: true,
      exportPrivateKeys: true,
    });
  const [stealthAddressData, setStealthAddressData] = useState<string[][]>([
    defaultExportHeaders,
  ]);

  const handleSettingsChange = (
    setting: keyof FluidKeyStealthSafeAddressGenerationParams,
    value: string | number | boolean
  ) => {
    setSettings((prev) => ({ ...prev, [setting]: value }));
  };

  const recoverStealthAccounts = async () => {
    setStealthAddressData([defaultExportHeaders]);
    if (props.keys?.viewingPrivateKey && props.keys?.spendingPrivateKey) {
      setIsLoading(true);

      const derivedBIP32Node = extractViewingPrivateKeyNode(
        props.keys.viewingPrivateKey,
        0
      );

      const spendingAccount = privateKeyToAccount(
        props.keys.spendingPrivateKey
      );
      const spendingPublicKey = spendingAccount.publicKey;

      const promises = [];
      for (let i = settings.startNonce; i < settings.endNonce; i++) {
        const { ephemeralPrivateKey } = generateEphemeralPrivateKey({
          viewingPrivateKeyNode: derivedBIP32Node,
          nonce: BigInt(i),
          chainId: props.chainId,
        });

        const { stealthAddresses } = generateStealthAddresses({
          spendingPublicKeys: [spendingPublicKey],
          ephemeralPrivateKey: ephemeralPrivateKey,
        });

        const params = {
          nonce: i,
          stealthAddresses,
          settings: settings,
          chainId: props.chainId as SupportedChainId,
          meta: {
            ephemeralPrivateKey: ephemeralPrivateKey,
            spendingPrivateKey: props.keys.spendingPrivateKey,
            spendingPublicKey: spendingPublicKey,
          },
        };

        promises.push(
          createCSVEntry.bind(null, params, () =>
            setProgress((i / settings.endNonce) * 100)
          )
        );
      }

      parallelLimit(promises, MAX_BATCH_SIZE, (err, results) => {
        if (err) {
          console.error(err);
        } else {
          setStealthAddressData((prev) => {
            return [...prev, ...(results as string[][])];
          });
        }
        setIsLoading(false);
      });
    }
  };

  useEffect(() => {
    let isValid = true;
    Object.keys(settings).forEach((key) => {
      if (
        !validateSettings(
          key as keyof FluidKeyStealthSafeAddressGenerationParams,
          settings
        )
      ) {
        isValid = false;
      }
    });
    setSettingsValid(isValid);
  }, [settings]);

  useEffect(() => {
    if (stealthAddressData.length > 1) {
      props.onStealthDataProcessed(stealthAddressData);
    }
  }, [stealthAddressData]);

  return (
    <>
      <StepContent>
        Click on the button below to initiate the recovery of stealth addresses.
        Feel free to customize additional settings as needed for a personalized
        experience.
        <Box
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "var(--u2)",
            width: "100%",
          }}
        >
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={14} />}
            onClick={() => props.onBack()}
          >
            Back
          </Button>
          <Button
            className="button"
            variant="filled"
            color="#191919"
            size="md"
            leftSection={<IconList size={14} />}
            onClick={recoverStealthAccounts}
            disabled={!isSettingsValid}
            loading={isLoading}
          >
            Recover Stealth Accounts
          </Button>
          <Button
            variant="subtle"
            onClick={() => setOpenSettings(!openSettings)}
          >
            Advanced settings
          </Button>
        </Box>
      </StepContent>
      <br />
      {isLoading && (
        <Progress animated={true} striped={true} value={progress} />
      )}
      <br />
      <StepContent hidden={!openSettings}>
        <Collapse
          in={openSettings}
          transitionDuration={250}
          transitionTimingFunction="linear"
        >
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "var(--u1)",
              paddingBottom: "var(--smallUnit)",
            }}
          >
            <b style={{ flex: "1 0 0" }}>Spending Private Key</b>
            <Code block={true}>{props.keys?.spendingPrivateKey}</Code>
            <CopyWithCheckButton value={props.keys?.spendingPrivateKey} />
          </Box>
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "var(--u1)",
              paddingBottom: "var(--u6)",
            }}
          >
            <b style={{ flex: "1 0 0" }}>Viewing Private Key</b>
            <Code block={true}>{props.keys?.viewingPrivateKey}</Code>
            <CopyWithCheckButton value={props.keys?.viewingPrivateKey} />
          </Box>

          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "var(--u2)",
            }}
          >
            <NumberInput
              label="Chain ID"
              placeholder={settings.chainId.toString()}
              allowDecimal={false}
              allowNegative={false}
              allowLeadingZeros={false}
              onChange={(v) => handleSettingsChange("chainId", v)}
              error={
                validateSettings("chainId", settings)
                  ? undefined
                  : "Invalid chain ID"
              }
            />
            <TextInput
              label="Safe Version"
              placeholder={settings.safeVersion}
              onChange={(v) =>
                handleSettingsChange("safeVersion", v.target.value)
              }
              error={
                validateSettings("safeVersion", settings)
                  ? undefined
                  : "Invalid version"
              }
            />
            <NumberInput
              label="First Nonce"
              placeholder={settings.startNonce.toString()}
              allowDecimal={false}
              allowNegative={false}
              allowLeadingZeros={false}
              onChange={(v) => handleSettingsChange("startNonce", v)}
              error={
                validateSettings("startNonce", settings)
                  ? undefined
                  : "Invalid nonce"
              }
            />
            <NumberInput
              label="Last Nonce"
              placeholder={settings.endNonce.toString()}
              allowDecimal={false}
              allowNegative={false}
              allowLeadingZeros={false}
              onChange={(v) => handleSettingsChange("endNonce", v)}
              error={
                validateSettings("endNonce", settings)
                  ? undefined
                  : "Invalid nonce"
              }
            />
          </Box>
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "var(--u2)",
              paddingTop: "var(--u2)",
            }}
          >
            <Switch
              label="Use Default Address"
              checked={settings.useDefaultAddress}
              description="When enabled, the Safe default address will be used."
              onChange={(v) =>
                handleSettingsChange("useDefaultAddress", v.target.checked)
              }
            />
            <Switch
              label="Export Private Keys"
              checked={settings.exportPrivateKeys}
              description="When enabled, the output will contain private keys for each stealth address. Use with caution!"
              onChange={(v) =>
                handleSettingsChange("exportPrivateKeys", v.target.checked)
              }
            />
          </Box>
        </Collapse>
      </StepContent>
    </>
  );
};
