import { useEffect, useState } from "react";

// Common Components
import { Card } from "./common/Card";

// Types
import { FKStealthSafeAddressGenerationParams } from "../types";

interface ComponentProps {
  onSettingsChanged: (settings: FKStealthSafeAddressGenerationParams) => void;
}

export const SettingsCard = (props: ComponentProps) => {
  const [settings, setSettings] =
    useState<FKStealthSafeAddressGenerationParams>({
      chainId: 0,
      startNonce: 0,
      endNonce: 5,
      safeVersion: "1.3.0",
      useDefaultAddress: true,
      exportPrivateKey: false,
    });

  useEffect(() => {
    if (settings) {
      props.onSettingsChanged(settings);
    }
  }, [settings]);

  return (
    <Card title="Settings">
      <div>
        <p>
          <b>chainId:</b>{" "}
          <input
            type="number"
            value={settings.chainId}
            onChange={(event) =>
              setSettings((prev) => {
                return {
                  ...prev,
                  chainId: event.target.valueAsNumber,
                };
              })
            }
          />
        </p>
        <p>
          <b>safeVersion:</b>{" "}
          <input
            type="text"
            value={settings.safeVersion}
            onChange={(event) =>
              setSettings((prev) => {
                return {
                  ...prev,
                  safeVersion: event.target.value as any,
                };
              })
            }
          />
        </p>
        <p>
          <b>useDefaultAddress:</b>{" "}
          <input
            type="checkbox"
            checked={settings.useDefaultAddress}
            onChange={(event) => {
              setSettings((prev) => {
                return {
                  ...prev,
                  useDefaultAddress: event.target.checked,
                };
              });
            }}
          />
        </p>
        <p>
          <b>startNonce:</b>{" "}
          <input
            type="number"
            value={settings.startNonce.toString()}
            onChange={(event) =>
              setSettings((prev) => {
                return {
                  ...prev,
                  startNonce: event.target.valueAsNumber,
                };
              })
            }
          />
        </p>
        <p>
          <b>endNonce:</b>{" "}
          <input
            type="number"
            value={settings.endNonce.toString()}
            onChange={(event) =>
              setSettings((prev) => {
                return {
                  ...prev,
                  endNonce: event.target.valueAsNumber,
                };
              })
            }
          />
        </p>
        <p>
          <b>export private keys:</b>{" "}
          <input
            type="checkbox"
            checked={settings.exportPrivateKey}
            onChange={(event) => {
              setSettings((prev) => {
                return {
                  ...prev,
                  exportPrivateKey: event.target.checked,
                };
              });
            }}
          />
        </p>
      </div>
    </Card>
  );
};
