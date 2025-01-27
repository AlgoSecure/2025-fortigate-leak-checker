# FortiGate Config Leak Checker

On January 14 2025, a hacker group leaked Fortinet FortiGate firewall configurations,
including plaintext credentials, for over 15,000 devices from an authentication bypass zero-day vulnerability disclosed in October 2022 ([CVE-2022-40684](https://nvd.nist.gov/vuln/detail/cve-2022-40684)).

The purpose of this tool is to check whether IPs or CIDRs are affected by the data leak ([source](https://github.com/arsolutioner/fortigate-belsen-leak/blob/main/affected_ips.txt)).

> The tool is available at: https://fortigate-leak-2025.algolighthouse.fr

If certain addresses are affected, we recommend that you update admin VPN credentials and monitor for unauthorized access.

In addition, it's strongly recommended to patch FortiOS/FortiProxy against the recent zero day [CVE-2024-55591](https://nvd.nist.gov/vuln/detail/cve-2024-55591):
- FortiOS 7.0.0 to 7.0.16 vulnerable, patched from 7.0.17
- FortiProxy 7.0.0 to 7.0.19 vulnerable, patched from 7.0.20
- FortiProxy 7.2.0 to 7.2.12 vulnerable, patched from 7.2.13

## Reference
- Censys - Massive FortiGate Config Leak: Assessing the Impact
- Medium - 2022 zero day was used to raid Fortigate firewall configs. Somebody just released them.
