import { useEffect } from "react";
import { Button, Table } from "@mantine/core";
import { RecoveredStealthSafeRow, SupportedChainId } from "@typing/index";
import { truncateEthAddress } from "@utils/index";
import { CopyWithCheckButton } from "./common/CopyButton";
import { useDeployStealthSafe } from "hooks/useDeployStealthSafe";
import { useChainId } from "wagmi";

interface ComponentProps {
  items: RecoveredStealthSafeRow[];
}

const SAFE_CHAIN_PREFIX: Record<SupportedChainId, string> = {
  1: "eth",
  10: "oeth",
  137: "matic",
  42_161: "arb1",
  8453: "base",
  100: "gno",
  11_155_111: "sep",
  56: "bsc",
  43_114: "avax",
};

const buildSafeInterfaceUrl = (
  row: RecoveredStealthSafeRow,
  selectedChainId?: number
) => {
  let chainKey: SupportedChainId | undefined;

  if (selectedChainId && SAFE_CHAIN_PREFIX[selectedChainId as SupportedChainId]) {
    chainKey = selectedChainId as SupportedChainId;
  } else if (SAFE_CHAIN_PREFIX[row.deploymentChainId]) {
    chainKey = row.deploymentChainId;
  }

  const prefix = chainKey ? SAFE_CHAIN_PREFIX[chainKey] : undefined;
  if (!prefix || !row.stealthSafeAddress.startsWith("0x")) {
    return undefined;
  }
  return `https://eternalsafe.eth.limo/balances?safe=${prefix}:${row.stealthSafeAddress}`;
};

export const StealthAddressStickyTable = (props: ComponentProps) => {
  const { deploy, error, isDeploying, pendingNonce } = useDeployStealthSafe();
  const selectedChainId = useChainId();

  useEffect(() => {
    if (error) {
      alert(error); // Lightweight feedback until a nicer UI is added.
    }
  }, [error]);

  const showNativeBalanceColumn = props.items.some(
    (item) => item.balances.native.value !== "-"
  );
  const showTokenBalanceColumn = props.items.some(
    (item) => (item.balances.token?.value ?? "-") !== "-"
  );
  const shouldRenderBalanceColumns =
    showNativeBalanceColumn || showTokenBalanceColumn;

  const nativeHeaderLabel =
    props.items.find((item) => item.balances.native.value !== "-")
      ?.balances.native.label ??
    props.items[0]?.balances.native.label ??
    "Native Balance";

  const tokenHeaderLabel =
    props.items.find(
      (item) => (item.balances.token?.value ?? "-") !== "-"
    )?.balances.token?.label ?? "Token Balance";

  const rows = props.items.map((item) => {
    const safeInterfaceUrl = buildSafeInterfaceUrl(item, selectedChainId);

    return (
      <Table.Tr key={item.nonce}>
      <Table.Td>{item.nonce}</Table.Td>
      <Table.Td>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {truncateEthAddress(item.stealthSafeAddress)}
          <CopyWithCheckButton value={item.stealthSafeAddress} />
        </div>
      </Table.Td>
      <Table.Td>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {truncateEthAddress(item.stealthSignerAddress)}
          <CopyWithCheckButton value={item.stealthSignerAddress} />
        </div>
      </Table.Td>
      <Table.Td>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {truncateEthAddress(item.stealthSignerKey)}
          <CopyWithCheckButton value={item.stealthSignerKey} />
        </div>
      </Table.Td>
      {shouldRenderBalanceColumns && (
        <>
          {showNativeBalanceColumn && (
            <Table.Td>{item.balances.native.value}</Table.Td>
          )}
          {showTokenBalanceColumn && (
            <Table.Td>{item.balances.token?.value ?? "-"}</Table.Td>
          )}
        </>
      )}
        <Table.Td>
          <div
            style={{
              display: "flex",
              gap: "var(--u1)",
              flexWrap: "wrap",
            }}
          >
            <Button
              size="xs"
              variant="default"
              disabled={
                !safeInterfaceUrl
              }
              onClick={() => {
                if (!safeInterfaceUrl) {
                  return;
                }
                window.open(safeInterfaceUrl, "_blank", "noopener,noreferrer");
              }}
            >
              Safe interface
            </Button>
            <Button
              size="xs"
              variant="light"
              disabled={
                isDeploying ||
                item.stealthSafeAddress === "-" ||
                !item.stealthSafeAddress.startsWith("0x")
              }
              loading={pendingNonce === item.nonce && isDeploying}
              onClick={() => {
                void deploy(item).catch(() => undefined);
              }}
            >
              Deploy
            </Button>
          </div>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Table.ScrollContainer
      minWidth="100%"
      style={{ width: "100%", maxHeight: "40vh", overflowY: "scroll" }}
    >
      <Table
        striped={true}
        highlightOnHover={true}
        withColumnBorders={true}
        stickyHeader={true}
        withTableBorder={true}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nonce</Table.Th>
            <Table.Th>Safe Address</Table.Th>
            <Table.Th>Signer Address</Table.Th>
            <Table.Th>Signer Key</Table.Th>
            {shouldRenderBalanceColumns && (
              <>
                {showNativeBalanceColumn && (
                  <Table.Th>{nativeHeaderLabel}</Table.Th>
                )}
                {showTokenBalanceColumn && (
                  <Table.Th>{tokenHeaderLabel}</Table.Th>
                )}
              </>
            )}
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};
