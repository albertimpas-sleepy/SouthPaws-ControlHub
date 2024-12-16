import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory';
import SortIcon from '@mui/icons-material/Sort';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PetsIcon from '@mui/icons-material/Pets';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HistoryIcon from '@mui/icons-material/History';
import ArchiveIcon from '@mui/icons-material/Archive';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

export const SidebarData = [
    {
        title: "Dashboard",
        icon: <HomeIcon />,
        link: "/home"
    },
   {
        title: "Products",
        icon: <VaccinesIcon  />,
        subItems: [
            {
                title: "Product List",
                icon: <ListAltIcon />,
                link: "/products"
            },

            {
                title: "Category",
                icon: <SortIcon />,
                link: "/category"
            },
            {
                title: "Inventory",
                icon: <InventoryIcon />,
                link: "/inventory"
            },
        ]
    },
    {
        title: "Suppliers",
        icon: <LocalShippingIcon />,
        link: "/suppliers"
    },
    {
        title: "Services",
        icon: <MedicalServicesIcon />,
        link: "/services"
    },
    {
        title: "Sales",
        icon: <ShowChartIcon  />, 
        subItems: [
            {
                title: "Point of Sales",
                icon: <PointOfSaleIcon />,
                link: "/pointofsales"
            },
            {
                title: "Sales List",
                icon: <ReceiptLongIcon />,
                link: "/Sales"
            },
            {
                title: "Orders",
                icon: <ShoppingCartIcon />,
                link: "/orders"
            },
        ]
    },
    {
        title: "Client Information",
        icon: <PetsIcon />,
        link: "/information/clients"
    },
    {
        title: "User Management",
        icon: <PersonAddIcon />,
        link: "/usermanagement"
    },
    {
        title: "Log History",
        icon: <HistoryIcon />,
        link: "/history"
    },
    {
        title: "Archive",
        icon: <ArchiveIcon />,
        link: "/archive"
    },

]