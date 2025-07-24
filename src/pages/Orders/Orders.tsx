// import { useEffect, useState } from 'react';
// import {
//   collection,
//   getDocs,
//   Timestamp
// } from "firebase/firestore";
// import { db } from "../../services/firebase";
// import {
//   Box,
//   CircularProgress,
//   Container,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TableSortLabel,
//   Typography,
//   TextField,
//   MenuItem,
//   Button,
//   Pagination,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   IconButton,
//   Tooltip
// } from '@mui/material';
// import { format } from 'date-fns';
// import { Visibility, Close } from '@mui/icons-material';
// import GoogleIcon from '@mui/icons-material/Google';
// import FacebookIcon from '@mui/icons-material/Facebook';

// interface Transaction {
//   id: string;
//   amount: number;
//   currency: string;
//   status: string;
//   createdAt?: Timestamp;
//   userId: string;
//   userName: string;
//   campaignType?: string; // Added for platform type
//   [key: string]: any; // Allow any additional fields
// }

// const Orders = () => {
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [sortField, setSortField] = useState<keyof Transaction>('createdAt');
//   const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
//   const [filterStatus, setFilterStatus] = useState<string>('all');
//   const [filterPlatform, setFilterPlatform] = useState<string>('all'); // New platform filter
//   const [searchQuery, setSearchQuery] = useState<string>('');
//   const [page, setPage] = useState(1);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
//   const itemsPerPage = 10;

//   useEffect(() => {
//     const fetchAllTransactions = async () => {
//       try {
//         setLoading(true);
//         const usersSnapshot = await getDocs(collection(db, 'crm_users'));
//         const allTransactions: Transaction[] = [];

//         for (const userDoc of usersSnapshot.docs) {
//           const userId = userDoc.id;
//           const userName = userDoc.data().displayName || userId;
//           const transactionsRef = collection(db, `crm_users/${userId}/transactions`);

//           try {
//             const transactionsSnapshot = await getDocs(transactionsRef);
//             transactionsSnapshot.forEach(transactionDoc => {
//               const transactionData = transactionDoc.data();
//               allTransactions.push({
//                 id: transactionDoc.id,
//                 userId,
//                 userName,
//                 ...transactionData
//               } as Transaction);
//             });
//           } catch (subError) {
//             console.error(`Error fetching transactions for user ${userId}:`, subError);
//           }
//         }

//         setTransactions(allTransactions);
//         setError(null);
//       } catch (err) {
//         console.error('Error fetching transactions:', err);
//         setError('Failed to load transactions. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllTransactions();
//   }, []);

//   const handleSort = (field: keyof Transaction) => {
//     const isAsc = sortField === field && sortDirection === 'asc';
//     setSortDirection(isAsc ? 'desc' : 'asc');
//     setSortField(field);
//   };

//   const filteredTransactions = transactions.filter(transaction => {
//     // Status filter
//     if (filterStatus !== 'all' && transaction.status !== filterStatus) {
//       return false;
//     }

//     // Platform filter
//     if (filterPlatform !== 'all') {
//       if (filterPlatform === 'google' && transaction.campaignType !== 'google') {
//         return false;
//       }
//       if (filterPlatform === 'meta' && transaction.campaignType !== 'meta') {
//         return false;
//       }
//     }

//     // Search query
//     if (searchQuery) {
//       const searchLower = searchQuery.toLowerCase();
//       return (
//         transaction.id.toLowerCase().includes(searchLower) ||
//         transaction.userName.toLowerCase().includes(searchLower) ||
//         String(transaction.amount).includes(searchQuery) ||
//         transaction.status.toLowerCase().includes(searchLower) ||
//         (transaction.referenceId && transaction.referenceId.toLowerCase().includes(searchLower))
//       );
//     }

//     return true;
//   });

//   const sortedTransactions = [...filteredTransactions].sort((a, b) => {
//     const aValue = a[sortField];
//     const bValue = b[sortField];

//     if (aValue === undefined && bValue === undefined) return 0;
//     if (aValue === undefined) return 1;
//     if (bValue === undefined) return -1;

//     if (aValue instanceof Timestamp && bValue instanceof Timestamp) {
//       return sortDirection === 'asc'
//         ? aValue.toMillis() - bValue.toMillis()
//         : bValue.toMillis() - aValue.toMillis();
//     }

//     if (typeof aValue === 'string' && typeof bValue === 'string') {
//       return sortDirection === 'asc'
//         ? aValue.localeCompare(bValue)
//         : bValue.localeCompare(aValue);
//     }

//     if (typeof aValue === 'number' && typeof bValue === 'number') {
//       return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
//     }

//     return 0;
//   });

//   const pageCount = Math.ceil(sortedTransactions.length / itemsPerPage);
//   const paginatedTransactions = sortedTransactions.slice(
//     (page - 1) * itemsPerPage,
//     page * itemsPerPage
//   );

//   const statusOptions = [
//     { value: 'all', label: 'All Statuses' },
//     { value: 'completed', label: 'Completed' },
//     { value: 'pending', label: 'Pending' },
//     { value: 'failed', label: 'Failed' },
//     { value: 'refunded', label: 'Refunded' },
//     { value: 'processing', label: 'Processing' },
//     { value: 'cancelled', label: 'Cancelled' },
//   ];

//   const platformOptions = [
//     { value: 'all', label: 'All Platforms' },
//     { value: 'google', label: 'Google' },
//     { value: 'meta', label: 'Meta' },
//   ];

//   const formatDate = (timestamp?: Timestamp) => {
//     if (!timestamp) return 'N/A';
//     return format(timestamp.toDate(), 'dd MMM yyyy, hh:mm a');
//   };

//   const formatCurrency = (amount: number, currency: string) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: currency || 'INR',
//     }).format(amount);
//   };

//   const handleViewDetails = (transaction: Transaction) => {
//     setSelectedTransaction(transaction);
//     setOpenDialog(true);
//   };

//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//     setSelectedTransaction(null);
//   };

//   const renderPlatform = (campaignType?: string) => {
//     if (!campaignType) return 'N/A';

//     return (
//       <Box display="flex" alignItems="center" gap={1}>
//         {campaignType === 'google' ? (
//           <>
//             <GoogleIcon fontSize="small" sx={{ color: '#4285F4' }} />
//             <Typography variant="body2">Google</Typography>
//           </>
//         ) : campaignType === 'meta' ? (
//           <>
//             <FacebookIcon fontSize="small" sx={{ color: '#4267B2' }} />
//             <Typography variant="body2">Meta</Typography>
//           </>
//         ) : (
//           <Typography variant="body2">N/A</Typography>
//         )}
//       </Box>
//     );
//   };

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
//         <CircularProgress size={60} />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
//         <Typography variant="h5" color="error" gutterBottom>
//           {error}
//         </Typography>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={() => window.location.reload()}
//           sx={{ mt: 2 }}
//         >
//           Retry
//         </Button>
//       </Container>
//     );
//   }

//   return (
//     <Container maxWidth="xl" sx={{ py: 4 }}>
//       <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
//         Ai Add Orders
//       </Typography>

//       {/* Filters and Search */}
//       <Paper sx={{ mb: 3, p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
//         <TextField
//           label="Search Transactions"
//           variant="outlined"
//           size="small"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           sx={{ minWidth: 250 }}
//           fullWidth
//         />

//         <TextField
//           select
//           label="Status"
//           variant="outlined"
//           size="small"
//           value={filterStatus}
//           onChange={(e) => setFilterStatus(e.target.value)}
//           sx={{ minWidth: 200 }}
//         >
//           {statusOptions.map((option) => (
//             <MenuItem key={option.value} value={option.value}>
//               {option.label}
//             </MenuItem>
//           ))}
//         </TextField>

//         <TextField
//           select
//           label="Platform"
//           variant="outlined"
//           size="small"
//           value={filterPlatform}
//           onChange={(e) => setFilterPlatform(e.target.value)}
//           sx={{ minWidth: 200 }}
//         >
//           {platformOptions.map((option) => (
//             <MenuItem key={option.value} value={option.value}>
//               {option.label}
//             </MenuItem>
//           ))}
//         </TextField>

//         <Button
//           variant="outlined"
//           onClick={() => {
//             setSearchQuery('');
//             setFilterStatus('all');
//             setFilterPlatform('all');
//           }}
//           sx={{ ml: 'auto' }}
//         >
//           Clear Filters
//         </Button>
//       </Paper>

//       {/* Results count */}
//       <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
//         Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
//         {filteredTransactions.length !== transactions.length &&
//           ` (filtered from ${transactions.length} total)`}
//       </Typography>

//       {/* Transactions Table */}
//       <TableContainer component={Paper} sx={{ mb: 3, borderRadius: 1 }}>
//         <Table size="small">
//           <TableHead>
//             <TableRow sx={{ backgroundColor: '#f5f7fa' }}>
//               <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
//                 <TableSortLabel
//                   active={sortField === 'createdAt'}
//                   direction={sortDirection}
//                   onClick={() => handleSort('createdAt')}
//                 >
//                   Date & Time
//                 </TableSortLabel>
//               </TableCell>
//               <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
//                 Platform
//               </TableCell>
//               <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
//                 <TableSortLabel
//                   active={sortField === 'id'}
//                   direction={sortDirection}
//                   onClick={() => handleSort('id')}
//                 >
//                   Transaction ID
//                 </TableSortLabel>
//               </TableCell>
//               <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>User</TableCell>
//               <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
//                 <TableSortLabel
//                   active={sortField === 'amount'}
//                   direction={sortDirection}
//                   onClick={() => handleSort('amount')}
//                 >
//                   Amount
//                 </TableSortLabel>
//               </TableCell>
//               <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
//                 <TableSortLabel
//                   active={sortField === 'status'}
//                   direction={sortDirection}
//                   onClick={() => handleSort('status')}
//                 >
//                   Status
//                 </TableSortLabel>
//               </TableCell>
//               <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Details</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {paginatedTransactions.length > 0 ? (
//               paginatedTransactions.map((transaction) => (
//                 <TableRow key={transaction.id} hover>
//                   <TableCell sx={{ fontSize: '0.8125rem' }}>{formatDate(transaction.createdAt)}</TableCell>
//                   <TableCell sx={{ fontSize: '0.8125rem' }}>
//                     {renderPlatform(transaction.campaignType)}
//                   </TableCell>
//                   <TableCell sx={{ fontSize: '0.8125rem' }}>{transaction.id}</TableCell>
//                   <TableCell sx={{ fontSize: '0.8125rem' }}>
//                     <Box>
//                       <Typography fontWeight={500} fontSize="0.8125rem">
//                         {transaction.userName}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary" fontSize="0.75rem">
//                         {transaction.userPhone || transaction.userId || 'N/A'}
//                       </Typography>
//                     </Box>
//                   </TableCell>
//                   <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
//                     {formatCurrency(transaction.amount, transaction.currency)}
//                   </TableCell>
//                   <TableCell sx={{ fontSize: '0.8125rem' }}>
//                     <Box
//                       sx={{
//                         display: 'inline-flex',
//                         alignItems: 'center',
//                         px: 1,
//                         py: 0.3,
//                         borderRadius: 0.5,
//                         fontSize: '0.75rem',
//                         fontWeight: 500,
//                         backgroundColor:
//                           transaction.status === 'completed'
//                             ? 'rgba(46, 125, 50, 0.1)'
//                             : transaction.status === 'pending'
//                             ? 'rgba(245, 127, 23, 0.1)'
//                             : transaction.status === 'failed'
//                             ? 'rgba(198, 40, 40, 0.1)'
//                             : transaction.status === 'refunded'
//                             ? 'rgba(21, 101, 192, 0.1)'
//                             : transaction.status === 'processing'
//                             ? 'rgba(2, 119, 189, 0.1)'
//                             : transaction.status === 'cancelled'
//                             ? 'rgba(97, 97, 97, 0.1)'
//                             : '#f5f5f5',
//                         color:
//                           transaction.status === 'completed'
//                             ? '#2e7d32'
//                             : transaction.status === 'pending'
//                             ? '#f57f17'
//                             : transaction.status === 'failed'
//                             ? '#c62828'
//                             : transaction.status === 'refunded'
//                             ? '#1565c0'
//                             : transaction.status === 'processing'
//                             ? '#0277bd'
//                             : transaction.status === 'cancelled'
//                             ? '#616161'
//                             : '#424242',
//                       }}
//                     >
//                       {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
//                     </Box>
//                   </TableCell>
//                   <TableCell>
//                     <Tooltip title="View details">
//                       <IconButton
//                         size="small"
//                         onClick={() => handleViewDetails(transaction)}
//                         sx={{ color: 'primary.main' }}
//                       >
//                         <Visibility fontSize="small" />
//                       </IconButton>
//                     </Tooltip>
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
//                   <Typography variant="body1" color="textSecondary">
//                     No transactions found
//                   </Typography>
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* Pagination */}
//       {pageCount > 1 && (
//         <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
//           <Pagination
//             count={pageCount}
//             page={page}
//             onChange={(_, value) => setPage(value)}
//             color="primary"
//             size="small"
//             showFirstButton
//             showLastButton
//           />
//         </Box>
//       )}

//       {/* Transaction Details Dialog */}
//       <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
//         <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           Transaction Details
//           <IconButton onClick={handleCloseDialog}>
//             <Close />
//           </IconButton>
//         </DialogTitle>
//         <DialogContent dividers>
//           {selectedTransaction && (
//             <Box sx={{ overflowX: 'auto' }}>
//               <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
//                 <tbody>
//                   {Object.entries(selectedTransaction).map(([key, value]) => (
//                     <tr key={key}>
//                       <td style={{
//                         padding: '8px 12px',
//                         fontWeight: 500,
//                         borderBottom: '1px solid #eee',
//                         fontSize: '0.8125rem'
//                       }}>
//                         {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
//                       </td>
//                       <td style={{
//                         padding: '8px 12px',
//                         borderBottom: '1px solid #eee',
//                         fontSize: '0.8125rem'
//                       }}>
//                         {key === 'createdAt' && value instanceof Timestamp
//                           ? formatDate(value)
//                           : key === 'amount'
//                             ? formatCurrency(value, selectedTransaction.currency)
//                             : typeof value === 'object'
//                               ? JSON.stringify(value, null, 2)
//                               : String(value)}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Box>
//             </Box>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog} variant="outlined">
//             Close
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Container>
//   );
// };

// export default Orders;


























import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../services/firebase";
import {
  Box,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  TextField,
  MenuItem,
  Button,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import { format } from "date-fns";
import { Visibility, Close, Search } from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";

type DateInput = Timestamp | Date | number | string;

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: DateInput;
  userId: string;
  userName: string;
  userPhone?: string;
  referenceId?: string;
  campaignType?: string;
  [key: string]: any;
}

const ITEMS_PER_PAGE = 10;

const convertToDate = (value: DateInput): Date | null => {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
};

const Orders = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Transaction>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchAllTransactions = async () => {
      try {
        setLoading(true);
        const usersSnapshot = await getDocs(collection(db, "crm_users"));
        const allTransactions: Transaction[] = [];

        for (const userDoc of usersSnapshot.docs) {
          const userId = userDoc.id;
          const userData = userDoc.data();
          const userName = userData.displayName || userId;
          const userPhone = userData.phone || "";
          const transactionsRef = collection(db, `crm_users/${userId}/transactions`);

          try {
            const transactionsSnapshot = await getDocs(transactionsRef);
            transactionsSnapshot.forEach((transactionDoc) => {
              allTransactions.push({
                ...transactionDoc.data(),
                id: transactionDoc.id,
                userId,
                userName,
                userPhone,
              } as Transaction);
            });
          } catch (subError) {
            console.error(`Error fetching transactions for user ${userId}:`, subError);
          }
        }

        setTransactions(allTransactions);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllTransactions();
  }, []);

  const handleSort = (field: keyof Transaction) => {
    const isAsc = sortField === field && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortField(field);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (filterStatus !== "all" && transaction.status !== filterStatus) return false;
      
      if (filterPlatform !== "all") {
        const campaignType = (transaction.campaignType || "").toLowerCase();
        if (filterPlatform === "google" && campaignType !== "google") return false;
        if (filterPlatform === "meta" && !["meta", "instagram", "facebook"].includes(campaignType)) return false;
      }

      if (!searchQuery) return true;
      
      const searchLower = searchQuery.toLowerCase();
      return (
        transaction.id.toLowerCase().includes(searchLower) ||
        transaction.userName.toLowerCase().includes(searchLower) ||
        String(transaction.amount).includes(searchQuery) ||
        transaction.status.toLowerCase().includes(searchLower) ||
        (transaction.referenceId && transaction.referenceId.toLowerCase().includes(searchLower))
      );
    });
  }, [transactions, filterStatus, filterPlatform, searchQuery]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;

      if (sortField === "timestamp") {
        const aDate = convertToDate(aValue);
        const bDate = convertToDate(bValue);
        if (aDate && bDate) {
          return sortDirection === "asc" 
            ? aDate.getTime() - bDate.getTime() 
            : bDate.getTime() - aDate.getTime();
        }
        return 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [filteredTransactions, sortField, sortDirection]);

  const formatDate = (dateValue: DateInput) => {
    const date = convertToDate(dateValue);
    return date ? format(date, "dd MMM yyyy, hh:mm a") : "N/A";
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
    }).format(amount);
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTransaction(null);
  };

  const renderPlatform = (campaignType?: string) => {
    if (!campaignType) return "N/A";
    const type = campaignType.toLowerCase();

    return (
      <Box display="flex" justifyContent="center">
        {type === "google" ? (
          <Tooltip title="Google Ads">
            <GoogleIcon fontSize="small" sx={{ color: "#4285F4" }} />
          </Tooltip>
        ) : type === "facebook" ? (
          <Tooltip title="Facebook Ads">
            <FacebookIcon fontSize="small" sx={{ color: '#4267B2' }} />
          </Tooltip>
        ) : type === "instagram" ? (
          <Tooltip title="Instagram Ads">
            <InstagramIcon fontSize="small" sx={{ color: "#E1306C" }} />
          </Tooltip>
        ) : type === "meta" ? (
          <Tooltip title="Meta Ads">
            <FacebookIcon fontSize="small" sx={{ color: '#4267B2' }} />
          </Tooltip>
        ) : (
          <Typography variant="body2" fontSize="0.75rem">{campaignType}</Typography>
        )}
      </Box>
    );
  };

  const pageCount = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return sortedTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedTransactions, page]);

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "completed", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
    { value: "processing", label: "Processing" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const platformOptions = [
    { value: "all", label: "All Platforms" },
    { value: "google", label: "Google" },
    { value: "meta", label: "Meta" },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Orders
      </Typography>

      {/* Filters and Search - Professional Style */}
      <Paper
        sx={{
          mb: 3,
          p: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          alignItems: "center",
          borderRadius: 1,
          background: "white",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
        }}
      >
        <TextField
          label="Search Transactions"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            flexGrow: 1,
            maxWidth: 300,
            '& .MuiInputBase-root': {
              height: 36,
              fontSize: '0.8125rem',
            },
            '& .MuiInputLabel-root': {
              fontSize: '0.8125rem',
              transform: 'translate(14px, 10px) scale(1)',
              '&.MuiInputLabel-shrink': {
                transform: 'translate(14px, -6px) scale(0.75)',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ ml: 0.5 }}>
                <Search fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          label="Status"
          variant="outlined"
          size="small"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          sx={{
            minWidth: 140,
            '& .MuiInputBase-root': {
              height: 36,
              fontSize: '0.8125rem',
            },
            '& .MuiInputLabel-root': {
              fontSize: '0.8125rem',
              transform: 'translate(14px, 10px) scale(1)',
              '&.MuiInputLabel-shrink': {
                transform: 'translate(14px, -6px) scale(0.75)',
              },
            },
          }}
        >
          {statusOptions.map((option) => (
            <MenuItem 
              key={option.value} 
              value={option.value}
              sx={{ fontSize: '0.8125rem', py: 0.5 }}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Platform"
          variant="outlined"
          size="small"
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          sx={{
            minWidth: 140,
            '& .MuiInputBase-root': {
              height: 36,
              fontSize: '0.8125rem',
            },
            '& .MuiInputLabel-root': {
              fontSize: '0.8125rem',
              transform: 'translate(14px, 10px) scale(1)',
              '&.MuiInputLabel-shrink': {
                transform: 'translate(14px, -6px) scale(0.75)',
              },
            },
          }}
        >
          {platformOptions.map((option) => (
            <MenuItem 
              key={option.value} 
              value={option.value}
              sx={{ fontSize: '0.8125rem', py: 0.5 }}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="outlined"
          onClick={() => {
            setSearchQuery("");
            setFilterStatus("all");
            setFilterPlatform("all");
          }}
          sx={{
            ml: "auto",
            fontSize: '0.8125rem',
            height: 36,
            px: 2,
            textTransform: 'none',
            borderColor: 'grey.300',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'grey.400',
            },
          }}
        >
          Clear Filters
        </Button>
      </Paper>

      {/* Results count */}
      <Typography variant="body2" sx={{ mb: 2, color: "text.secondary", fontSize: '0.8125rem' }}>
        Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
        {filteredTransactions.length !== transactions.length &&
          ` (filtered from ${transactions.length} total)`}
      </Typography>

      {/* Transactions Table */}
      <TableContainer
        component={Paper}
        sx={{
          mb: 3,
          borderRadius: 1,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                <TableSortLabel
                  active={sortField === "timestamp"}
                  direction={sortDirection}
                  onClick={() => handleSort("timestamp")}
                >
                  Date & Time
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, fontSize: "0.8125rem" }}
              >
                Platform
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                <TableSortLabel
                  active={sortField === "id"}
                  direction={sortDirection}
                  onClick={() => handleSort("id")}
                >
                  Transaction ID
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                User
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: 600, fontSize: "0.8125rem" }}
              >
                <TableSortLabel
                  active={sortField === "amount"}
                  direction={sortDirection}
                  onClick={() => handleSort("amount")}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                <TableSortLabel
                  active={sortField === "status"}
                  direction={sortDirection}
                  onClick={() => handleSort("status")}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                Details
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell sx={{ fontSize: "0.8125rem" }}>
                    {formatDate(transaction.timestamp)}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.8125rem" }}>
                    {renderPlatform(transaction.campaignType)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem" }}>
                    {transaction.id}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem" }}>
                    <Box>
                      <Typography fontWeight={500} fontSize="0.8125rem">
                        {transaction.userName}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        fontSize="0.75rem"
                      >
                        {transaction.userPhone || transaction.userId || "N/A"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 600, fontSize: "0.8125rem" }}
                  >
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem" }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        px: 1,
                        py: 0.3,
                        borderRadius: 0.5,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        backgroundColor:
                          transaction.status === "completed"
                            ? "rgba(46, 125, 50, 0.1)"
                            : transaction.status === "pending"
                            ? "rgba(245, 127, 23, 0.1)"
                            : transaction.status === "failed"
                            ? "rgba(198, 40, 40, 0.1)"
                            : transaction.status === "refunded"
                            ? "rgba(21, 101, 192, 0.1)"
                            : transaction.status === "processing"
                            ? "rgba(2, 119, 189, 0.1)"
                            : transaction.status === "cancelled"
                            ? "rgba(97, 97, 97, 0.1)"
                            : "#f5f5f5",
                        color:
                          transaction.status === "completed"
                            ? "#2e7d32"
                            : transaction.status === "pending"
                            ? "#f57f17"
                            : transaction.status === "failed"
                            ? "#c62828"
                            : transaction.status === "refunded"
                            ? "#1565c0"
                            : transaction.status === "processing"
                            ? "#0277bd"
                            : transaction.status === "cancelled"
                            ? "#616161"
                            : "#424242",
                      }}
                    >
                      {transaction.status.charAt(0).toUpperCase() +
                        transaction.status.slice(1)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(transaction)}
                        sx={{ color: "primary.main" }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No transactions found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pageCount > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="small"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Transaction Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#f8fafc",
            fontWeight: 600,
            fontSize: '0.9375rem',
            py: 1.5,
          }}
        >
          Transaction Details
          <IconButton
            onClick={handleCloseDialog}
            sx={{ color: "text.primary" }}
            size="small"
          >
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          {selectedTransaction && (
            <Box sx={{ overflowX: "auto" }}>
              <Box
                component="table"
                sx={{ width: "100%", borderCollapse: "collapse" }}
              >
                <tbody>
                  {Object.entries(selectedTransaction).map(([key, value]) => (
                    <tr key={key}>
                      <td
                        style={{
                          padding: "6px 12px",
                          fontWeight: 500,
                          borderBottom: "1px solid #eee",
                          fontSize: "0.8125rem",
                          color: "#555",
                          minWidth: "120px",
                        }}
                      >
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </td>
                      <td
                        style={{
                          padding: "6px 12px",
                          borderBottom: "1px solid #eee",
                          fontSize: "0.8125rem",
                          wordBreak: "break-word",
                        }}
                      >
                        {key === "timestamp"
                          ? formatDate(value)
                          : key === "campaignType"
                          ? renderPlatform(value as string)
                          : key === "amount"
                          ? formatCurrency(
                              value as number,
                              selectedTransaction.currency
                            )
                          : typeof value === "object"
                          ? JSON.stringify(value, null, 2)
                          : String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#f8fafc", py: 1 }}>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            color="primary"
            size="small"
            sx={{ borderRadius: 1, textTransform: "none", fontSize: '0.8125rem' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Orders;
